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