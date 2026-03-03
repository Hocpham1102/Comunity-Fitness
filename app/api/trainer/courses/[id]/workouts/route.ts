import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

const anyDb = db as any

// GET trainer's workout templates for course builder picker
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Verify course belongs to this trainer
        const course = await anyDb.course.findUnique({ where: { id } })
        if (!course || course.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const workouts = await db.workout.findMany({
            where: {
                createdById: user.id,
                // No approval filter — trainers can use their own workouts
                // regardless of admin approval status
            },
            select: {
                id: true,
                name: true,
                description: true,
                difficulty: true,
                estimatedTime: true,
                approvalStatus: true,
                _count: { select: { exercises: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            workouts: workouts.map(w => ({
                ...w,
                exerciseCount: w._count.exercises,
            }))
        })
    } catch (error) {
        console.error('Get course workouts error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
