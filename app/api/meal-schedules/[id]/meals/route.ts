import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// POST /api/meal-schedules/[id]/meals - Thêm bữa ăn vào lịch
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Kiểm tra lịch có thuộc về người dùng không
        const schedule = await db.mealSchedule.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        })

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        const body = await request.json()
        const { foodId, mealType, scheduledDate, quantity, notes } = body

        if (!foodId || !mealType || !scheduledDate || !quantity) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const scheduledMeal = await db.scheduledMeal.create({
            data: {
                scheduleId: id,
                foodId,
                mealType,
                scheduledDate: new Date(scheduledDate),
                quantity,
                notes,
            },
            include: {
                food: true,
            },
        })

        return NextResponse.json(scheduledMeal, { status: 201 })
    } catch (error) {
        console.error('Error adding scheduled meal:', error)
        return NextResponse.json(
            { error: 'Failed to add scheduled meal' },
            { status: 500 }
        )
    }
}

// GET /api/meal-schedules/[id]/meals - Lấy danh sách bữa ăn trong lịch
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Kiểm tra lịch có thuộc về người dùng không
        const schedule = await db.mealSchedule.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        })

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const meals = await db.scheduledMeal.findMany({
            where: {
                scheduleId: id,
                ...(startDate && endDate && {
                    scheduledDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
            },
            include: {
                food: true,
            },
            orderBy: {
                scheduledDate: 'asc',
            },
        })

        return NextResponse.json(meals)
    } catch (error) {
        console.error('Error fetching scheduled meals:', error)
        return NextResponse.json(
            { error: 'Failed to fetch scheduled meals' },
            { status: 500 }
        )
    }
}
