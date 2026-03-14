import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// GET /api/meal-schedules - Lấy danh sách tất cả lịch của user
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const schedules = await db.mealSchedule.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                scheduledMeals: {
                    include: {
                        food: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(schedules)
    } catch (error) {
        console.error('Error fetching meal schedules:', error)
        return NextResponse.json(
            { error: 'Failed to fetch meal schedules' },
            { status: 500 }
        )
    }
}

// POST /api/meal-schedules - Tạo lịch mới
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, scheduleType, startDate, endDate } = body

        // Validate required fields
        if (!name || !scheduleType || !startDate) {
            return NextResponse.json(
                { error: 'Missing required fields: name, scheduleType, startDate' },
                { status: 400 }
            )
        }

        // Validate scheduleType
        if (!['WEEKLY', 'MONTHLY', 'YEARLY'].includes(scheduleType)) {
            return NextResponse.json(
                { error: 'Invalid scheduleType. Must be WEEKLY, MONTHLY, or YEARLY' },
                { status: 400 }
            )
        }

        // Unset tất cả active schedules cũ, rồi tạo mới active trong 1 transaction
        await db.mealSchedule.updateMany({
            where: { userId: session.user.id, isActive: true },
            data: { isActive: false },
        })

        const schedule = await db.mealSchedule.create({
            data: {
                userId: session.user.id,
                name,
                description: description || null,
                scheduleType,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                isActive: true,
            },
            include: {
                scheduledMeals: {
                    include: {
                        food: true,
                    },
                },
            },
        })

        return NextResponse.json(schedule, { status: 201 })
    } catch (error) {
        console.error('Error creating meal schedule:', error)
        return NextResponse.json(
            { error: 'Failed to create meal schedule' },
            { status: 500 }
        )
    }
}
