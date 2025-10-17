import { NextRequest, NextResponse } from 'next/server'
import { verifySession, getSessionOrNull } from '@/lib/server/auth/session'
import { revalidateTag } from 'next/cache'
import { createWorkoutSchema } from '@/lib/shared/schemas/workout.schema'
import { BadRequestError, createWorkout, listWorkouts } from '@/lib/server/services/workouts.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '20')
    const isPublic = searchParams.get('isPublic') === 'true'
    const mine = searchParams.get('mine') === 'true'

    const session = await getSessionOrNull()
    const user = session?.user ? { id: session.user.id, role: session.user.role } : undefined

    const result = await listWorkouts({ page, pageSize, isPublic, mine }, user)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('List workouts error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifySession()

    const body = await request.json()
    const data = createWorkoutSchema.parse(body)

    const workout = await createWorkout(user.id, data)

    revalidateTag('workouts')
    revalidateTag(`workout:${workout?.id}`)

    return NextResponse.json(workout, { status: 201 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input data', errors: error.issues }, { status: 400 })
    }
    if (error instanceof BadRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Create workout error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


