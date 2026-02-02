import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { z } from 'zod'

// Schema for creating/updating exercise
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

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') // 'all', 'pending', 'approved', 'rejected'

        const where: any = {
            createdById: user.id,
        }

        // Filter by approval status
        if (status && status !== 'all') {
            where.approvalStatus = status.toUpperCase()
        }

        const exercises = await db.exercise.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                instructions: true,
                muscleGroups: true,
                equipment: true,
                difficulty: true,
                videoUrl: true,
                thumbnailUrl: true,
                defaultReps: true,
                defaultWeight: true,
                approvalStatus: true,
                rejectionReason: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({ data: exercises }, { status: 200 })
    } catch (error) {
        console.error('List trainer exercises error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        const body = await request.json()
        const data = exerciseSchema.parse(body)

        // Create exercise with PENDING status
        const exercise = await db.exercise.create({
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
                isPublic: false, // Not public until approved
                approvalStatus: 'PENDING' as any,
                createdById: user.id,
            },
        })

        return NextResponse.json(exercise, { status: 201 })
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Invalid input data', errors: error.issues },
                { status: 400 }
            )
        }
        console.error('Create trainer exercise error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
