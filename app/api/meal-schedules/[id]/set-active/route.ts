import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

/**
 * PATCH /api/meal-schedules/[id]/set-active
 * Set schedule này thành active, tất cả schedule khác của user thành inactive.
 */
export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params

        // Verify schedule belongs to user
        const schedule = await db.mealSchedule.findFirst({
            where: { id, userId: session.user.id },
            select: { id: true },
        })
        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        // Unset all, then set this one active — in a transaction
        await db.$transaction([
            db.mealSchedule.updateMany({
                where: { userId: session.user.id, isActive: true },
                data: { isActive: false },
            }),
            db.mealSchedule.update({
                where: { id },
                data: { isActive: true },
            }),
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Set active error:', error)
        return NextResponse.json({ error: 'Failed to set active schedule' }, { status: 500 })
    }
}
