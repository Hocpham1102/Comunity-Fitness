import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/server/services/exercises.service'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const exercise = await getExerciseById(id)
    if (!exercise) {
      return NextResponse.json({ message: 'Exercise not found' }, { status: 404 })
    }

    return NextResponse.json(exercise, { status: 200 })
  } catch (error) {
    console.error('Get exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

import { updateExercise, deleteExercise } from '@/lib/server/services/exercises.service'
import { getSessionOrNull } from '@/lib/server/auth/session'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrNull()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()

    const updated = await updateExercise(id, {
      name: body.name,
      description: body.description,
      instructions: body.instructions,
      muscleGroups: body.muscleGroups,
      equipment: body.equipment,
      difficulty: body.difficulty,
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
      defaultWeight: body.defaultWeight ? parseFloat(body.defaultWeight) : null,
      defaultReps: body.defaultReps ? parseInt(body.defaultReps, 10) : null,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Update exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrNull()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await context.params
    await deleteExercise(id)

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Delete exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}