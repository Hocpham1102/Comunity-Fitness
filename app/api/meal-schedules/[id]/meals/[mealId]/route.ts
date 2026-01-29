import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// PATCH /api/meal-schedules/[id]/meals/[mealId] - Cập nhật bữa ăn đã lên lịch
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; mealId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, mealId } = await params

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
        const { foodId, mealType, scheduledDate, quantity, notes, isCompleted } = body

        const updatedMeal = await db.scheduledMeal.update({
            where: { id: mealId },
            data: {
                ...(foodId && { foodId }),
                ...(mealType && { mealType }),
                ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
                ...(quantity !== undefined && { quantity }),
                ...(notes !== undefined && { notes }),
                ...(isCompleted !== undefined && { isCompleted }),
            },
            include: {
                food: true,
            },
        })

        return NextResponse.json(updatedMeal)
    } catch (error) {
        console.error('Error updating scheduled meal:', error)
        return NextResponse.json(
            { error: 'Failed to update scheduled meal' },
            { status: 500 }
        )
    }
}

// DELETE /api/meal-schedules/[id]/meals/[mealId] - Xóa bữa ăn khỏi lịch
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; mealId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, mealId } = await params

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

        await db.scheduledMeal.delete({
            where: { id: mealId },
        })

        return NextResponse.json({ message: 'Scheduled meal deleted successfully' })
    } catch (error) {
        console.error('Error deleting scheduled meal:', error)
        return NextResponse.json(
            { error: 'Failed to delete scheduled meal' },
            { status: 500 }
        )
    }
}
