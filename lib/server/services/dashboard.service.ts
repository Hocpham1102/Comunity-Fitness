import { db } from '@/lib/server/db/prisma'

export interface DashboardStats {
    workouts: {
        total: number
        change: number // percentage change from last week
    }
    calories: {
        total: number
        change: number // change from yesterday
    }
    weight: {
        current: number | null
        change: number | null // change from last month
        unit: string
    }
    streak: {
        days: number
        message: string
    }
    recentWorkouts: Array<{
        id: string
        title: string
        duration: number | null
        startedAt: Date
    }>
}

/**
 * Calculate workout streak (consecutive days with at least one completed workout)
 */
async function calculateWorkoutStreak(userId: string): Promise<{ days: number; message: string }> {
    const workouts = await db.workoutLog.findMany({
        where: {
            userId,
            completedAt: { not: null },
        },
        select: {
            completedAt: true,
        },
        orderBy: {
            completedAt: 'desc',
        },
    })

    if (workouts.length === 0) {
        return { days: 0, message: 'Start your first workout!' }
    }

    // Group workouts by date
    const workoutDates = new Set<string>()
    workouts.forEach(workout => {
        if (workout.completedAt) {
            const date = new Date(workout.completedAt)
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            workoutDates.add(dateStr)
        }
    })

    // Calculate streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`

        if (workoutDates.has(dateStr)) {
            streak++
        } else if (i > 0) {
            // Allow today to not have a workout yet
            break
        }
    }

    const message = streak >= 7 ? 'Keep it up! 🔥' : streak >= 3 ? 'Great progress! 💪' : 'Keep going! 🎯'
    return { days: streak, message }
}

/**
 * Get dashboard statistics for a user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const lastWeekStart = new Date(now)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    lastWeekStart.setHours(0, 0, 0, 0)

    const twoWeeksAgoStart = new Date(now)
    twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 14)
    twoWeeksAgoStart.setHours(0, 0, 0, 0)

    const lastMonthStart = new Date(now)
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)

    // Fetch all completed workouts
    const [allWorkouts, lastWeekWorkouts, previousWeekWorkouts, recentWorkouts, latestWeight, previousWeight] = await Promise.all([
        // Total completed workouts
        db.workoutLog.count({
            where: {
                userId,
                completedAt: { not: null },
            },
        }),

        // Last 7 days workouts
        db.workoutLog.findMany({
            where: {
                userId,
                completedAt: {
                    gte: lastWeekStart,
                    not: null,
                },
            },
            select: {
                duration: true,
                completedAt: true,
            },
        }),

        // Previous 7 days workouts (for comparison)
        db.workoutLog.count({
            where: {
                userId,
                completedAt: {
                    gte: twoWeeksAgoStart,
                    lt: lastWeekStart,
                    not: null,
                },
            },
        }),

        // Recent 5 workouts
        db.workoutLog.findMany({
            where: {
                userId,
                completedAt: { not: null },
            },
            select: {
                id: true,
                title: true,
                duration: true,
                startedAt: true,
            },
            orderBy: {
                completedAt: 'desc',
            },
            take: 5,
        }),

        // Latest weight measurement
        db.bodyMeasurement.findFirst({
            where: {
                profile: {
                    userId,
                },
                weight: { not: null },
            },
            select: {
                weight: true,
                measuredAt: true,
            },
            orderBy: {
                measuredAt: 'desc',
            },
        }),

        // Previous weight (from last month)
        db.bodyMeasurement.findFirst({
            where: {
                profile: {
                    userId,
                },
                weight: { not: null },
                measuredAt: {
                    lt: lastMonthStart,
                },
            },
            select: {
                weight: true,
            },
            orderBy: {
                measuredAt: 'desc',
            },
        }),
    ])

    // Calculate calories burned (estimate: 6.5 calories per minute)
    const totalCaloriesToday = lastWeekWorkouts
        .filter(w => {
            const workoutDate = new Date(w.completedAt!)
            workoutDate.setHours(0, 0, 0, 0)
            const todayDate = new Date()
            todayDate.setHours(0, 0, 0, 0)
            return workoutDate.getTime() === todayDate.getTime()
        })
        .reduce((sum, w) => sum + (w.duration || 0) * 6.5, 0)

    const totalCaloriesYesterday = lastWeekWorkouts
        .filter(w => {
            const workoutDate = new Date(w.completedAt!)
            workoutDate.setHours(0, 0, 0, 0)
            return workoutDate.getTime() === yesterday.getTime()
        })
        .reduce((sum, w) => sum + (w.duration || 0) * 6.5, 0)

    // Calculate workout change percentage
    const workoutChange = previousWeekWorkouts > 0
        ? Math.round(((lastWeekWorkouts.length - previousWeekWorkouts) / previousWeekWorkouts) * 100)
        : lastWeekWorkouts.length > 0 ? 100 : 0

    // Calculate weight change
    const currentWeight = latestWeight?.weight || null
    const weightChange = currentWeight && previousWeight?.weight
        ? Number((currentWeight - previousWeight.weight).toFixed(1))
        : null

    // Calculate streak
    const streak = await calculateWorkoutStreak(userId)

    return {
        workouts: {
            total: allWorkouts,
            change: workoutChange,
        },
        calories: {
            total: Math.round(totalCaloriesToday),
            change: Math.round(totalCaloriesToday - totalCaloriesYesterday),
        },
        weight: {
            current: currentWeight,
            change: weightChange,
            unit: 'kg',
        },
        streak,
        recentWorkouts,
    }
}
