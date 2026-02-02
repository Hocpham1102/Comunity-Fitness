import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { revalidateTag } from 'next/cache'
import { createWorkoutSchema } from '@/lib/shared/schemas/workout.schema'
import { BadRequestError, createWorkout, listWorkouts } from '@/lib/server/services/workouts.service'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only trainers can access this endpoint
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get('page') ?? '1')
        const pageSize = Number(searchParams.get('pageSize') ?? '20')
        const q = searchParams.get('q') || undefined
        const difficulty = searchParams.get('difficulty') || undefined

        // List only templates created by this trainer
        const result = await listWorkouts({
            page,
            pageSize,
            mine: true,
            q,
            difficulty,
            isTemplate: true
        }, { id: user.id, role: user.role })

        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        console.error('List trainer workouts error:', error)
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
        const data = createWorkoutSchema.parse(body)

        // Trainers can create templates - pass TRAINER role to allow it
        const workoutData = {
            ...data,
            isTemplate: true
        }

        const workout = await createWorkout(user.id, workoutData, 'TRAINER')

        return NextResponse.json(workout, { status: 201 })
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json({ message: 'Invalid input data', errors: error.issues }, { status: 400 })
        }
        if (error instanceof BadRequestError) {
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        console.error('Create trainer workout error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
