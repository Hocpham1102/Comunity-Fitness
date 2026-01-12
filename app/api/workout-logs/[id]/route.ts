import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { updateWorkoutProgress, getWorkoutLogById } from '@/lib/server/services/workout-logs.service'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { user } = await verifySession()

    const log = await getWorkoutLogById(id, user)
    return NextResponse.json(log, { status: 200 })
  } catch (error: any) {
    if (error.message === 'Workout log not found' || error.message === 'Access denied') {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    console.error('Get workout log error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { user } = await verifySession()
    const body = await request.json()

    const { currentExerciseOrder, currentSetNumber, restUntil } = body

    const log = await updateWorkoutProgress(id, {
      currentExerciseOrder,
      currentSetNumber,
      restUntil: restUntil ? new Date(restUntil) : undefined,
    }, user)

    return NextResponse.json(log, { status: 200 })
  } catch (error: any) {
    if (error.message === 'Workout log not found' || error.message === 'Access denied') {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    console.error('Update workout progress error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
