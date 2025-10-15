import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'
import { updateWorkoutSchema } from '@/lib/shared/schemas/workout.schema'
import { deleteWorkout, getWorkoutById, updateWorkout } from '@/lib/server/services/workouts.service'

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const session = await auth()
    const user = session?.user ? { id: session.user.id, role: session.user.role } : undefined

    const workout = await getWorkoutById(id, user)
    if (!workout) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(workout, { status: 200 })
  } catch (error) {
    console.error('Get workout error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateWorkoutSchema.parse({ ...body, id })

    const updated = await updateWorkout(id, parsed, { id: session.user.id, role: session.user.role })
    if (!updated) {
      // Avoid disclosing existence
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    revalidateTag('workouts')
    revalidateTag(`workout:${id}`)

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input data', errors: error.issues }, { status: 400 })
    }
    console.error('Update workout error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const ok = await deleteWorkout(id, { id: session.user.id, role: session.user.role })
    if (!ok) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    revalidateTag('workouts')
    revalidateTag(`workout:${id}`)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete workout error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


