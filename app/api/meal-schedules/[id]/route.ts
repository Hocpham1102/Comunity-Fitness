import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// GET /api/meal-schedules/[id] - Lấy chi tiết lịch
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
        const schedule = await db.mealSchedule.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                scheduledMeals: {
                    include: {
                        food: true,
                    },
                    orderBy: {
                        scheduledDate: 'asc',
                    },
                },
            },
        })

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        return NextResponse.json(schedule)
    } catch (error) {
        console.error('Error fetching meal schedule:', error)
        return NextResponse.json(
            { error: 'Failed to fetch meal schedule' },
            { status: 500 }
        )
    }
}

// PATCH /api/meal-schedules/[id] - Cập nhật lịch
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, description, scheduleType, startDate, endDate, isActive } = body

        const schedule = await db.mealSchedule.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        })

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        const updatedSchedule = await db.mealSchedule.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(scheduleType && { scheduleType }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                scheduledMeals: {
                    include: {
                        food: true,
                    },
                },
            },
        })

        return NextResponse.json(updatedSchedule)
    } catch (error) {
        console.error('Error updating meal schedule:', error)
        return NextResponse.json(
            { error: 'Failed to update meal schedule' },
            { status: 500 }
        )
    }
}

// DELETE /api/meal-schedules/[id] - Xóa lịch
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const schedule = await db.mealSchedule.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        })

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        await db.mealSchedule.delete({
            where: { id: id },
        })

        return NextResponse.json({ message: 'Schedule deleted successfully' })
    } catch (error) {
        console.error('Error deleting meal schedule:', error)
        return NextResponse.json(
            { error: 'Failed to delete meal schedule' },
            { status: 500 }
        )
    }
}
