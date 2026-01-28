import { FitnessGoal } from '@prisma/client'
import { db } from '@/lib/server/db/prisma'

/**
 * Nutrition targets calculated based on TDEE and fitness goals
 */
export interface NutritionTargets {
    targetCalories: number
    targetProtein: number // grams
    targetCarbs: number // grams
    targetFats: number // grams
}

/**
 * Macro ratios based on body weight (g/kg)
 * Following ISSN and ACSM scientific guidelines
 */
const MACRO_RATIOS = {
    LOSE_WEIGHT: {
        calorieAdjustment: -500, // Moderate deficit for ~0.5kg/week loss
        proteinPerKg: 2.2, // Preserve muscle mass during deficit
        fatsPerKg: 0.9, // Minimum for hormonal health
    },
    GAIN_MUSCLE: {
        calorieAdjustment: 300, // Controlled surplus for lean gains
        proteinPerKg: 2.0, // Support muscle protein synthesis
        fatsPerKg: 1.0, // Support testosterone production
    },
    MAINTAIN_WEIGHT: {
        calorieAdjustment: 0, // TDEE maintenance
        proteinPerKg: 1.8, // Muscle preservation
        fatsPerKg: 0.9, // Health minimum
    },
    IMPROVE_ENDURANCE: {
        calorieAdjustment: 0, // TDEE maintenance
        proteinPerKg: 1.6, // Recovery support
        fatsPerKg: 0.8, // Baseline
    },
    GENERAL_FITNESS: {
        calorieAdjustment: 0, // TDEE maintenance
        proteinPerKg: 1.8, // General health
        fatsPerKg: 0.9, // Balanced
    },
} as const

/**
 * Calculate nutrition targets based on TDEE, body weight, and fitness goal
 * Uses scientific formulas: protein and fats based on body weight (g/kg),
 * carbs fill remaining calories
 */
export function calculateNutritionTargets(
    tdee: number,
    bodyWeight: number, // in kg
    fitnessGoal: FitnessGoal
): NutritionTargets {
    // Get macro ratios for the fitness goal
    const ratios = MACRO_RATIOS[fitnessGoal] || MACRO_RATIOS.GENERAL_FITNESS

    // 1. Calculate target calories
    const targetCalories = Math.round(tdee + ratios.calorieAdjustment)

    // 2. Calculate protein (g/kg body weight)
    const targetProtein = Math.round(bodyWeight * ratios.proteinPerKg)
    const proteinCalories = targetProtein * 4 // 4 cal per gram

    // 3. Calculate fats (g/kg body weight)
    const targetFats = Math.round(bodyWeight * ratios.fatsPerKg)
    const fatsCalories = targetFats * 9 // 9 cal per gram

    // 4. Calculate carbs from remaining calories
    const remainingCalories = targetCalories - proteinCalories - fatsCalories
    const targetCarbs = Math.max(0, Math.round(remainingCalories / 4)) // 4 cal per gram

    return {
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFats,
    }
}

/**
 * Get nutrition targets for a user
 * Returns custom targets if set, otherwise calculates from TDEE
 */
export async function getNutritionTargets(userId: string): Promise<NutritionTargets | null> {
    const profile = await db.profile.findUnique({
        where: { userId },
        select: {
            currentWeight: true,
            tdee: true,
            fitnessGoal: true,
            targetCalories: true,
            targetProtein: true,
            targetCarbs: true,
            targetFats: true,
            useCustomTargets: true,
        },
    })

    if (!profile) {
        return null
    }

    // If user has custom targets, return them
    if (
        profile.useCustomTargets &&
        profile.targetCalories &&
        profile.targetProtein &&
        profile.targetCarbs &&
        profile.targetFats
    ) {
        return {
            targetCalories: profile.targetCalories,
            targetProtein: profile.targetProtein,
            targetCarbs: profile.targetCarbs,
            targetFats: profile.targetFats,
        }
    }

    // Otherwise, calculate from TDEE
    if (!profile.tdee || !profile.currentWeight || !profile.fitnessGoal) {
        // Return default targets if profile is incomplete
        return {
            targetCalories: 2000,
            targetProtein: 150,
            targetCarbs: 200,
            targetFats: 65,
        }
    }

    return calculateNutritionTargets(profile.tdee, profile.currentWeight, profile.fitnessGoal)
}

/**
 * Update user's nutrition targets
 * If isCustom is true, saves the provided targets as custom
 * If isCustom is false, recalculates from TDEE and saves
 */
export async function updateNutritionTargets(
    userId: string,
    targets: NutritionTargets,
    isCustom: boolean
): Promise<void> {
    await db.profile.update({
        where: { userId },
        data: {
            targetCalories: targets.targetCalories,
            targetProtein: targets.targetProtein,
            targetCarbs: targets.targetCarbs,
            targetFats: targets.targetFats,
            useCustomTargets: isCustom,
        },
    })
}

/**
 * Reset user's targets to auto-calculated (from TDEE)
 */
export async function resetToAutoTargets(userId: string): Promise<NutritionTargets | null> {
    const profile = await db.profile.findUnique({
        where: { userId },
        select: {
            currentWeight: true,
            tdee: true,
            fitnessGoal: true,
        },
    })

    if (!profile?.tdee || !profile.currentWeight || !profile.fitnessGoal) {
        return null
    }

    const targets = calculateNutritionTargets(
        profile.tdee,
        profile.currentWeight,
        profile.fitnessGoal
    )

    await db.profile.update({
        where: { userId },
        data: {
            targetCalories: targets.targetCalories,
            targetProtein: targets.targetProtein,
            targetCarbs: targets.targetCarbs,
            targetFats: targets.targetFats,
            useCustomTargets: false,
        },
    })

    return targets
}
