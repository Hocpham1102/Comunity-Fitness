import { db } from '@/lib/server/db/prisma'

export interface AdminStats {
    totalUsers: number
    currentMonthUsers: number
    userGrowth: number
    totalWorkouts: number
    totalExercises: number
    totalFoods: number
    totalWorkoutLogs: number
}

export async function getAdminStats(): Promise<AdminStats> {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [
        totalUsers,
        currentMonthUsers,
        lastMonthUsers,
        totalWorkouts,
        totalExercises,
        totalFoods,
        totalWorkoutLogs,
    ] = await Promise.all([
        db.user.count(),
        db.user.count({
            where: {
                createdAt: {
                    gte: currentMonthStart,
                },
            },
        }),
        db.user.count({
            where: {
                createdAt: {
                    gte: lastMonthStart,
                    lte: lastMonthEnd,
                },
            },
        }),
        db.workout.count(),
        db.exercise.count(),
        db.food.count(),
        db.workoutLog.count(),
    ])

    // Calculate growth percentage
    const userGrowth = lastMonthUsers > 0
        ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0

    return {
        totalUsers,
        currentMonthUsers,
        userGrowth,
        totalWorkouts,
        totalExercises,
        totalFoods,
        totalWorkoutLogs,
    }
}
