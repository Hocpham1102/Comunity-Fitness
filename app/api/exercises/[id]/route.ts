import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { deleteExercise, getExerciseById, updateExercise } from '@/lib/server/services/exercises.service'
import { exerciseSchema } from '@/lib/shared/schemas/workout.schema'

const updateExerciseSchema = exerciseSchema.partial().extend({ id: z.string().min(1) })

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const exercise = await getExerciseById(id)
    if (!exercise) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json(exercise, { status: 200 })
  } catch (error) {
    console.error('Get exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = context.params
    const body = await request.json()
    const parsed = updateExerciseSchema.parse({ ...body, id })

    const updated = await updateExercise(id, { id: session.user.id, role: session.user.role }, parsed)
    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    revalidateTag('exercises')
    revalidateTag(`exercise:${id}`)

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input data', errors: error.issues }, { status: 400 })
    }
    console.error('Update exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = context.params
    const ok = await deleteExercise(id, { id: session.user.id, role: session.user.role })
    if (!ok) return NextResponse.json({ message: 'Not found' }, { status: 404 })

    revalidateTag('exercises')
    revalidateTag(`exercise:${id}`)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


