import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { z } from 'zod'

// Schema for updating exercise
const exerciseSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    muscleGroups: z.array(z.string()).min(1, 'At least one muscle group is required'),
    equipment: z.array(z.string()).min(1, 'At least one equipment type is required'),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
    videoUrl: z.union([z.string().url(), z.literal('')]).optional(),
    thumbnailUrl: z.union([z.string().url(), z.literal('')]).optional(),
    defaultReps: z.number().int().positive().optional(),
    defaultWeight: z.number().positive().optional(),
})

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { user } = await verifySession()

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        const exercise = await db.exercise.findUnique({
            where: { id },
        })

        if (!exercise) {
            return NextResponse.json({ message: 'Exercise not found' }, { status: 404 })
        }

        // Verify ownership
        if (exercise.createdById !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json(exercise, { status: 200 })
    } catch (error) {
        console.error('Get trainer exercise error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { user } = await verifySession()

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Check if exercise exists and verify ownership
        const existingExercise = await db.exercise.findUnique({
            where: { id },
        })

        if (!existingExercise) {
            return NextResponse.json({ message: 'Exercise not found' }, { status: 404 })
        }

        if (existingExercise.createdById !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const data = exerciseSchema.parse(body)

        // Update exercise and reset to PENDING if it was REJECTED
        const exercise = await db.exercise.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                instructions: data.instructions,
                muscleGroups: { set: data.muscleGroups as any },
                equipment: { set: data.equipment as any },
                difficulty: data.difficulty,
                videoUrl: data.videoUrl || null,
                thumbnailUrl: data.thumbnailUrl || null,
                defaultReps: data.defaultReps,
                defaultWeight: data.defaultWeight,
            },
        })

        return NextResponse.json(exercise, { status: 200 })
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Invalid input data', errors: error.issues },
                { status: 400 }
            )
        }
        console.error('Update trainer exercise error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { user } = await verifySession()

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Check if exercise exists and verify ownership
        const existingExercise = await db.exercise.findUnique({
            where: { id },
        })

        if (!existingExercise) {
            return NextResponse.json({ message: 'Exercise not found' }, { status: 404 })
        }

        if (existingExercise.createdById !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        // Delete the exercise
        await db.exercise.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Exercise deleted successfully' }, { status: 200 })
    } catch (error: any) {
        console.error('Delete trainer exercise error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
