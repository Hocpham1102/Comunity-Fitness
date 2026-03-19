import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { z } from 'zod'
import { createNotification } from '@/lib/server/services/notification.service'

const assignWorkoutSchema = z.object({
    clientIds: z.array(z.string()).min(1, 'At least one client must be selected'),
    notes: z.string().optional(),
})

// POST /api/trainer/workouts/[id]/assign - Assign workout to clients
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { user } = await verifySession()

        // Only trainers can assign workouts
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Verify workout exists and belongs to trainer
        const workout = await db.workout.findUnique({
            where: { id },
        })

        if (!workout) {
            return NextResponse.json({ message: 'Workout not found' }, { status: 404 })
        }

        if (workout.createdById !== user.id) {
            return NextResponse.json(
                { message: 'You can only assign your own workouts' },
                { status: 403 }
            )
        }

        if (!workout.isTemplate) {
            return NextResponse.json(
                { message: 'Only templates can be assigned' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { clientIds, notes } = assignWorkoutSchema.parse(body)

        // Verify all clients belong to this trainer
        const trainerClients = await db.trainerClient.findMany({
            where: {
                trainerId: user.id,
                clientId: { in: clientIds },
                status: 'ACTIVE',
            },
            select: { clientId: true },
        })

        const validClientIds = trainerClients.map((tc) => tc.clientId)
        const invalidClientIds = clientIds.filter((id) => !validClientIds.includes(id))

        if (invalidClientIds.length > 0) {
            return NextResponse.json(
                {
                    message: 'Some clients are not your active clients',
                    invalidClientIds,
                },
                { status: 400 }
            )
        }

        // Create assignments (upsert to handle duplicates)
        const assignments = await Promise.all(
            clientIds.map((clientId) =>
                db.workoutAssignment.upsert({
                    where: {
                        workoutId_clientId: {
                            workoutId: id,
                            clientId,
                        },
                    },
                    create: {
                        workoutId: id,
                        clientId,
                        trainerId: user.id,
                        notes,
                    },
                    update: {
                        notes,
                        assignedAt: new Date(), // Update assignment date
                    },
                })
            )
        )

        // Notify clients
        for (const clientId of clientIds) {
            await createNotification({
                userId: clientId,
                type: 'WORKOUT_ASSIGNED',
                title: 'New Workout',
                message: `Your trainer has assigned the workout "${workout.name}" to you.`,
                link: '/workouts',
            })
        }

        return NextResponse.json(
            {
                success: true,
                assignedCount: assignments.length,
                message: `Workout assigned to ${assignments.length} client(s)`,
            },
            { status: 200 }
        )
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Invalid input data', errors: error.issues },
                { status: 400 }
            )
        }
        console.error('Assign workout error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/trainer/workouts/[id]/assign - Unassign workout from clients
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { user } = await verifySession()

        // Only trainers can unassign workouts
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Verify workout belongs to trainer
        const workout = await db.workout.findUnique({
            where: { id },
        })

        if (!workout) {
            return NextResponse.json({ message: 'Workout not found' }, { status: 404 })
        }

        if (workout.createdById !== user.id) {
            return NextResponse.json(
                { message: 'You can only unassign your own workouts' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { clientIds } = z
            .object({ clientIds: z.array(z.string()).min(1) })
            .parse(body)

        // Delete assignments
        const result = await db.workoutAssignment.deleteMany({
            where: {
                workoutId: id,
                clientId: { in: clientIds },
                trainerId: user.id,
            },
        })

        return NextResponse.json(
            {
                success: true,
                unassignedCount: result.count,
                message: `Workout unassigned from ${result.count} client(s)`,
            },
            { status: 200 }
        )
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Invalid input data', errors: error.issues },
                { status: 400 }
            )
        }
        console.error('Unassign workout error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
