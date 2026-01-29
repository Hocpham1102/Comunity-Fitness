import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// GET /api/meal-schedules/today - Lấy danh sách scheduled meals của hôm nay
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get today's date range (start and end of day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Query scheduled meals for today
        const scheduledMeals = await db.scheduledMeal.findMany({
            where: {
                schedule: {
                    userId: session.user.id,
                    isActive: true,
                },
                scheduledDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                food: true,
                schedule: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { mealType: 'asc' },
                { scheduledDate: 'asc' },
            ],
        })

        return NextResponse.json(scheduledMeals)
    } catch (error) {
        console.error('Error fetching today\'s scheduled meals:', error)
        return NextResponse.json(
            { error: 'Failed to fetch scheduled meals' },
            { status: 500 }
        )
    }
}
