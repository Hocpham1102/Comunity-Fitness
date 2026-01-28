import { db } from "@/lib/server/db/prisma";
import { AchievementType, AchievementTier } from "@prisma/client";
import {
    ACHIEVEMENT_DEFINITIONS,
    getAchievementDefinition,
    getAchievementsByType,
    TIER_POINTS,
} from "@/lib/constants/achievements";

/**
 * Initialize all achievements for a new user
 */
export async function initializeUserAchievements(userId: string) {
    const existingCount = await db.achievement.count({
        where: { userId },
    });

    // Only initialize if user has no achievements
    if (existingCount > 0) {
        return;
    }

    const achievementsToCreate = ACHIEVEMENT_DEFINITIONS.map((def) => ({
        userId,
        type: def.type,
        tier: def.tier,
        title: def.title,
        description: def.description,
        icon: def.icon,
        target: def.target,
        progress: 0,
        isUnlocked: false,
    }));

    await db.achievement.createMany({
        data: achievementsToCreate,
    });
}

/**
 * Update progress for a specific achievement type
 */
export async function updateAchievementProgress(
    userId: string,
    type: AchievementType,
    newValue: number
) {
    const achievements = await db.achievement.findMany({
        where: {
            userId,
            type,
            isUnlocked: false,
        },
        orderBy: {
            target: "asc",
        },
    });

    const unlockedAchievements = [];

    for (const achievement of achievements) {
        await db.achievement.update({
            where: { id: achievement.id },
            data: { progress: newValue },
        });

        // Check if unlocked
        if (newValue >= achievement.target) {
            const unlocked = await db.achievement.update({
                where: { id: achievement.id },
                data: {
                    isUnlocked: true,
                    unlockedAt: new Date(),
                    progress: achievement.target,
                },
            });
            unlockedAchievements.push(unlocked);
        }
    }

    return unlockedAchievements;
}

/**
 * Check and unlock all achievements for a user
 */
export async function checkAndUnlockAchievements(userId: string) {
    // Ensure user has all achievements initialized
    await initializeUserAchievements(userId);

    const stats = await calculateUserStats(userId);
    const allUnlocked = [];

    // Check workout count achievements
    const workoutCountUnlocked = await updateAchievementProgress(
        userId,
        "WORKOUT_COUNT",
        stats.totalWorkouts
    );
    allUnlocked.push(...workoutCountUnlocked);

    // Check streak achievements
    const streakUnlocked = await updateAchievementProgress(
        userId,
        "STREAK",
        stats.currentStreak
    );
    allUnlocked.push(...streakUnlocked);

    // Check volume achievements
    const volumeUnlocked = await updateAchievementProgress(
        userId,
        "VOLUME",
        Math.round(stats.totalVolume)
    );
    allUnlocked.push(...volumeUnlocked);

    // Check duration achievements
    const durationUnlocked = await updateAchievementProgress(
        userId,
        "DURATION",
        stats.totalDuration
    );
    allUnlocked.push(...durationUnlocked);

    // Check consistency achievements
    const consistencyUnlocked = await updateAchievementProgress(
        userId,
        "CONSISTENCY",
        stats.consistencyCount
    );
    allUnlocked.push(...consistencyUnlocked);

    // Check variety achievements
    const varietyUnlocked = await updateAchievementProgress(
        userId,
        "VARIETY",
        stats.uniqueWorkouts
    );
    allUnlocked.push(...varietyUnlocked);

    // Check early bird achievements
    const earlyBirdUnlocked = await updateAchievementProgress(
        userId,
        "EARLY_BIRD",
        stats.earlyBirdWorkouts
    );
    allUnlocked.push(...earlyBirdUnlocked);

    // Check night owl achievements
    const nightOwlUnlocked = await updateAchievementProgress(
        userId,
        "NIGHT_OWL",
        stats.nightOwlWorkouts
    );
    allUnlocked.push(...nightOwlUnlocked);

    // Check weekend warrior achievements
    const weekendUnlocked = await updateAchievementProgress(
        userId,
        "WEEKEND_WARRIOR",
        stats.weekendWorkouts
    );
    allUnlocked.push(...weekendUnlocked);

    // Check nutrition achievements
    const nutritionUnlocked = await updateAchievementProgress(
        userId,
        "NUTRITION",
        stats.nutritionStreak
    );
    allUnlocked.push(...nutritionUnlocked);

    return allUnlocked;
}

/**
 * Calculate user statistics for achievement checking
 */
async function calculateUserStats(userId: string) {
    // Get all completed workouts
    const workouts = await db.workoutLog.findMany({
        where: {
            userId,
            completedAt: { not: null },
        },
        orderBy: { completedAt: "asc" },
        include: {
            exerciseLogs: {
                include: {
                    sets: true,
                },
            },
            workout: true,
        },
    });

    // Total workouts
    const totalWorkouts = workouts.length;

    // Calculate total volume (sum of weight × reps)
    let totalVolume = 0;
    for (const workout of workouts) {
        for (const exerciseLog of workout.exerciseLogs) {
            for (const set of exerciseLog.sets) {
                if (set.weight && set.reps) {
                    totalVolume += set.weight * set.reps;
                }
            }
        }
    }

    // Calculate total duration
    const totalDuration = workouts.reduce(
        (sum, w) => sum + (w.duration || 0),
        0
    );

    // Calculate current streak
    const currentStreak = calculateStreak(
        workouts.map((w) => w.completedAt!).reverse()
    );

    // Calculate consistency (workouts in regular pattern)
    const consistencyCount = calculateConsistency(
        workouts.map((w) => w.completedAt!)
    );

    // Calculate unique workouts (variety)
    const uniqueWorkoutIds = new Set(
        workouts.map((w) => w.workoutId).filter(Boolean)
    );
    const uniqueWorkouts = uniqueWorkoutIds.size;

    // Calculate time-based achievements
    const earlyBirdWorkouts = workouts.filter((w) => {
        const hour = new Date(w.completedAt!).getHours();
        return hour < 7;
    }).length;

    const nightOwlWorkouts = workouts.filter((w) => {
        const hour = new Date(w.completedAt!).getHours();
        return hour >= 21;
    }).length;

    const weekendWorkouts = workouts.filter((w) => {
        const day = new Date(w.completedAt!).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }).length;

    // Calculate nutrition streak
    const nutritionStreak = await calculateNutritionStreak(userId);

    return {
        totalWorkouts,
        totalVolume,
        totalDuration,
        currentStreak,
        consistencyCount,
        uniqueWorkouts,
        earlyBirdWorkouts,
        nightOwlWorkouts,
        weekendWorkouts,
        nutritionStreak,
    };
}

/**
 * Calculate consecutive day streak
 */
function calculateStreak(completedDates: Date[]): number {
    if (completedDates.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if last workout was today or yesterday
    const lastWorkout = new Date(completedDates[0]);
    lastWorkout.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
        (today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 1) return 0; // Streak broken

    // Count consecutive days
    for (let i = 1; i < completedDates.length; i++) {
        const current = new Date(completedDates[i - 1]);
        current.setHours(0, 0, 0, 0);

        const previous = new Date(completedDates[i]);
        previous.setHours(0, 0, 0, 0);

        const diff = Math.floor(
            (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) {
            streak++;
        } else if (diff > 1) {
            break;
        }
    }

    return streak;
}

/**
 * Calculate consistency (regular workout patterns)
 */
function calculateConsistency(completedDates: Date[]): number {
    if (completedDates.length < 3) return 0;

    // Group workouts by week
    const weeklyWorkouts: { [key: string]: number } = {};

    for (const date of completedDates) {
        const d = new Date(date);
        const year = d.getFullYear();
        const week = getWeekNumber(d);
        const key = `${year}-W${week}`;

        weeklyWorkouts[key] = (weeklyWorkouts[key] || 0) + 1;
    }

    // Count weeks with at least 3 workouts
    let consistentWeeks = 0;
    for (const count of Object.values(weeklyWorkouts)) {
        if (count >= 3) {
            consistentWeeks++;
        }
    }

    return consistentWeeks * 3; // Return total workouts in consistent weeks
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Calculate nutrition tracking streak
 */
async function calculateNutritionStreak(userId: string): Promise<number> {
    const logs = await db.nutritionLog.findMany({
        where: { userId },
        orderBy: { consumedAt: "desc" },
        select: { consumedAt: true },
    });

    if (logs.length === 0) return 0;

    // Group by day and count consecutive days
    const daysWithLogs = new Set<string>();
    for (const log of logs) {
        const date = new Date(log.consumedAt);
        date.setHours(0, 0, 0, 0);
        daysWithLogs.add(date.toISOString());
    }

    const sortedDays = Array.from(daysWithLogs)
        .map((d) => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

    return calculateStreak(sortedDays);
}

/**
 * Get achievement statistics for a user
 */
export async function getAchievementStats(userId: string) {
    const achievements = await db.achievement.findMany({
        where: { userId },
    });

    const totalAchievements = achievements.length;
    const unlockedAchievements = achievements.filter((a) => a.isUnlocked).length;
    const unlockRate = totalAchievements > 0
        ? (unlockedAchievements / totalAchievements) * 100
        : 0;

    // Calculate total points
    let totalPoints = 0;
    for (const achievement of achievements) {
        if (achievement.isUnlocked) {
            const points = TIER_POINTS[achievement.tier];
            totalPoints += points;
        }
    }

    // Tier breakdown
    const tierBreakdown = {
        BRONZE: { total: 0, unlocked: 0 },
        SILVER: { total: 0, unlocked: 0 },
        GOLD: { total: 0, unlocked: 0 },
        PLATINUM: { total: 0, unlocked: 0 },
        DIAMOND: { total: 0, unlocked: 0 },
    };

    for (const achievement of achievements) {
        tierBreakdown[achievement.tier].total++;
        if (achievement.isUnlocked) {
            tierBreakdown[achievement.tier].unlocked++;
        }
    }

    return {
        totalAchievements,
        unlockedAchievements,
        unlockRate: Math.round(unlockRate),
        totalPoints,
        tierBreakdown,
    };
}

/**
 * Get user's achievements grouped by category
 */
export async function getUserAchievementsByCategory(userId: string) {
    await initializeUserAchievements(userId);

    const achievements = await db.achievement.findMany({
        where: { userId },
        orderBy: [{ type: "asc" }, { tier: "asc" }],
    });

    // Group by type
    const grouped: { [key in AchievementType]?: typeof achievements } = {};

    for (const achievement of achievements) {
        if (!grouped[achievement.type]) {
            grouped[achievement.type] = [];
        }
        grouped[achievement.type]!.push(achievement);
    }

    return grouped;
}
