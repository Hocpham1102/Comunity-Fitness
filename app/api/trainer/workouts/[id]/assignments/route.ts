import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

// GET /api/trainer/workouts/[id]/assignments - Get all assignments for a workout
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await verifySession()

        // Only trainers can view assignments
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Verify workout belongs to trainer
        const workout = await db.workout.findUnique({
            where: { id: params.id },
        })

        if (!workout) {
            return NextResponse.json({ message: 'Workout not found' }, { status: 404 })
        }

        if (workout.createdById !== user.id) {
            return NextResponse.json(
                { message: 'You can only view assignments for your own workouts' },
                { status: 403 }
            )
        }

        // Get all assignments with client details
        const assignments = await db.workoutAssignment.findMany({
            where: {
                workoutId: params.id,
                trainerId: user.id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                assignedAt: 'desc',
            },
        })

        return NextResponse.json(
            {
                assignments: assignments.map((a: {
                    id: string
                    clientId: string
                    assignedAt: Date
                    notes: string | null
                    client: {
                        id: string
                        name: string | null
                        email: string
                        image: string | null
                    }
                }) => ({
                    id: a.id,
                    clientId: a.clientId,
                    clientName: a.client.name,
                    clientEmail: a.client.email,
                    clientImage: a.client.image,
                    assignedAt: a.assignedAt,
                    notes: a.notes,
                })),
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Get workout assignments error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
