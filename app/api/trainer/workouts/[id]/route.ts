import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { revalidateTag } from 'next/cache'
import { createWorkoutSchema } from '@/lib/shared/schemas/workout.schema'
import { BadRequestError, getWorkoutById, updateWorkout, deleteWorkout } from '@/lib/server/services/workouts.service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await verifySession()
        const { id } = await params

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        const workout = await getWorkoutById(id, { id: user.id, role: user.role })

        if (!workout) {
            return NextResponse.json({ message: 'Workout not found' }, { status: 404 })
        }

        // Verify ownership
        if (workout.createdById !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json(workout, { status: 200 })
    } catch (error) {
        console.error('Get trainer workout error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await verifySession()
        const { id } = await params

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Verify ownership
        const existingWorkout = await getWorkoutById(id, { id: user.id, role: user.role })
        if (!existingWorkout) {
            return NextResponse.json({ message: 'Workout not found' }, { status: 404 })
        }
        if (existingWorkout.createdById !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const data = createWorkoutSchema.parse(body)

        // Trainers can edit their templates
        const workout = await updateWorkout(id, data, { id: user.id, role: 'TRAINER' })

        return NextResponse.json(workout, { status: 200 })
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json({ message: 'Invalid input data', errors: error.issues }, { status: 400 })
        }
        if (error instanceof BadRequestError) {
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        console.error('Update trainer workout error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await verifySession()
        const { id } = await params

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        // Verify ownership
        const existingWorkout = await getWorkoutById(id, { id: user.id, role: user.role })
        if (!existingWorkout) {
            return NextResponse.json({ message: 'Workout not found' }, { status: 404 })
        }
        if (existingWorkout.createdById !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await deleteWorkout(id, { id: user.id, role: user.role })

        return NextResponse.json({ message: 'Workout deleted successfully' }, { status: 200 })
    } catch (error: any) {
        if (error instanceof BadRequestError) {
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        console.error('Delete trainer workout error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
