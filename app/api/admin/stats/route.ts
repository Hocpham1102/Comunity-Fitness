import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        // Get current month start and last month start
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

        const stats = {
            totalUsers,
            currentMonthUsers,
            userGrowth,
            totalWorkouts,
            totalExercises,
            totalFoods,
            totalWorkoutLogs,
        }

        return NextResponse.json(stats, { status: 200 })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
