/**
 * Meal Plan Service
 * CRUD operations for meal plans and meal plan foods
 */

import { db } from '@/lib/server/db/prisma'
import { MealType } from '@prisma/client'

export interface CreateMealPlanInput {
    name: string
    description?: string
    targetCalories?: number
    targetProtein?: number
    targetCarbs?: number
    targetFats?: number
    cycleDays?: number // Number of days in the meal plan cycle (default: 7)
    isPublic?: boolean
}

export interface UpdateMealPlanInput {
    name?: string
    description?: string
    targetCalories?: number
    targetProtein?: number
    targetCarbs?: number
    targetFats?: number
    cycleDays?: number
    isPublic?: boolean
}

export interface AddMealToPlanInput {
    foodId: string
    mealType: MealType
    quantity: number
    dayOfCycle?: number // Day in the cycle (1-7 for weekly, 1-30 for monthly, default: 1)
    order?: number
}

export interface MealPlanWithNutrition {
    id: string
    name: string
    description: string | null
    targetCalories: number | null
    targetProtein: number | null
    targetCarbs: number | null
    targetFats: number | null
    cycleDays: number
    isPublic: boolean
    createdById: string | null
    mealCount: number
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFats: number
}

/**
 * Create a new meal plan
 */
export async function createMealPlan(
    trainerId: string,
    data: CreateMealPlanInput
) {
    return await db.mealPlan.create({
        data: {
            name: data.name,
            description: data.description,
            targetCalories: data.targetCalories,
            targetProtein: data.targetProtein,
            targetCarbs: data.targetCarbs,
            targetFats: data.targetFats,
            cycleDays: data.cycleDays ?? 7, // Default to 7-day cycle
            isPublic: data.isPublic ?? false,
            createdById: trainerId,
        },
        include: {
            meals: {
                include: {
                    food: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    })
}

/**
 * Get all meal plans for a trainer
 */
export async function getMealPlans(
    trainerId: string,
    options?: {
        page?: number
        pageSize?: number
        search?: string
    }
) {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 20
    const skip = (page - 1) * pageSize

    const where = {
        createdById: trainerId,
        ...(options?.search && {
            OR: [
                { name: { contains: options.search, mode: 'insensitive' as const } },
                { description: { contains: options.search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [items, total] = await Promise.all([
        db.mealPlan.findMany({
            where,
            include: {
                meals: {
                    include: {
                        food: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: pageSize,
        }),
        db.mealPlan.count({ where }),
    ])

    // Calculate nutrition totals for each plan
    const itemsWithNutrition: MealPlanWithNutrition[] = items.map((plan) => {
        const nutrition = plan.meals.reduce(
            (acc, meal) => {
                // Food nutrition values are per 100g, so multiply by (quantity / 100)
                const multiplier = meal.quantity / 100
                return {
                    calories: acc.calories + meal.food.calories * multiplier,
                    protein: acc.protein + meal.food.protein * multiplier,
                    carbs: acc.carbs + meal.food.carbs * multiplier,
                    fats: acc.fats + meal.food.fats * multiplier,
                }
            },
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        )

        return {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            targetCalories: plan.targetCalories,
            targetProtein: plan.targetProtein,
            targetCarbs: plan.targetCarbs,
            targetFats: plan.targetFats,
            cycleDays: plan.cycleDays,
            isPublic: plan.isPublic,
            createdById: plan.createdById,
            mealCount: plan.meals.length,
            totalCalories: Math.round(nutrition.calories),
            totalProtein: Math.round(nutrition.protein),
            totalCarbs: Math.round(nutrition.carbs),
            totalFats: Math.round(nutrition.fats),
        }
    })

    return {
        items: itemsWithNutrition,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    }
}

/**
 * Get a single meal plan by ID
 */
export async function getMealPlanById(id: string, trainerId?: string) {
    const plan = await db.mealPlan.findUnique({
        where: { id },
        include: {
            meals: {
                include: {
                    food: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    })

    // If trainerId is provided, verify ownership
    if (plan && trainerId && plan.createdById !== trainerId) {
        throw new Error('Unauthorized: You do not own this meal plan')
    }

    return plan
}

/**
 * Update a meal plan
 */
export async function updateMealPlan(
    id: string,
    trainerId: string,
    data: UpdateMealPlanInput
) {
    // Verify ownership
    const plan = await getMealPlanById(id, trainerId)
    if (!plan) {
        throw new Error('Meal plan not found')
    }

    return await db.mealPlan.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            targetCalories: data.targetCalories,
            targetProtein: data.targetProtein,
            targetCarbs: data.targetCarbs,
            targetFats: data.targetFats,
            isPublic: data.isPublic,
        },
        include: {
            meals: {
                include: {
                    food: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    })
}

/**
 * Delete a meal plan
 */
export async function deleteMealPlan(id: string, trainerId: string) {
    // Verify ownership
    const plan = await getMealPlanById(id, trainerId)
    if (!plan) {
        throw new Error('Meal plan not found')
    }

    // Delete the plan (cascade will delete associated meals)
    await db.mealPlan.delete({
        where: { id },
    })
}

/**
 * Add a meal to a plan
 */
export async function addMealToPlan(
    planId: string,
    trainerId: string,
    meal: AddMealToPlanInput
) {
    // Verify ownership
    const plan = await getMealPlanById(planId, trainerId)
    if (!plan) {
        throw new Error('Meal plan not found')
    }

    // Get the current max order
    const maxOrder = await db.mealPlanFood.findFirst({
        where: { mealPlanId: planId },
        orderBy: { order: 'desc' },
        select: { order: true },
    })

    const order = meal.order ?? (maxOrder?.order ?? 0) + 1

    return await db.mealPlanFood.create({
        data: {
            mealPlanId: planId,
            foodId: meal.foodId,
            mealType: meal.mealType,
            quantity: meal.quantity,
            dayOfCycle: meal.dayOfCycle ?? 1, // Default to day 1
            order,
        },
        include: {
            food: true,
        },
    })
}

/**
 * Remove a meal from a plan
 */
export async function removeMealFromPlan(
    planId: string,
    mealId: string,
    trainerId: string
) {
    // Verify ownership
    const plan = await getMealPlanById(planId, trainerId)
    if (!plan) {
        throw new Error('Meal plan not found')
    }

    // Verify meal belongs to plan
    const meal = await db.mealPlanFood.findUnique({
        where: { id: mealId },
    })

    if (!meal || meal.mealPlanId !== planId) {
        throw new Error('Meal not found in this plan')
    }

    await db.mealPlanFood.delete({
        where: { id: mealId },
    })
}

/**
 * Calculate total nutrition for a meal plan
 */
export async function calculatePlanNutrition(planId: string) {
    const plan = await db.mealPlan.findUnique({
        where: { id: planId },
        include: {
            meals: {
                include: {
                    food: true,
                },
            },
        },
    })

    if (!plan) {
        throw new Error('Meal plan not found')
    }

    const nutrition = plan.meals.reduce(
        (acc, meal) => {
            // Food nutrition values are per 100g, so multiply by (quantity / 100)
            const multiplier = meal.quantity / 100
            return {
                calories: acc.calories + meal.food.calories * multiplier,
                protein: acc.protein + meal.food.protein * multiplier,
                carbs: acc.carbs + meal.food.carbs * multiplier,
                fats: acc.fats + meal.food.fats * multiplier,
            }
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    return {
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein),
        carbs: Math.round(nutrition.carbs),
        fats: Math.round(nutrition.fats),
    }
}
