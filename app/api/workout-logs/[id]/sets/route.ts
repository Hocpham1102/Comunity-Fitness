import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { appendSetToWorkout } from '@/lib/server/services/workout-logs.service'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { user } = await verifySession()
    const body = await request.json()

    const { exerciseId, setNumber, reps, weight, duration, distance, completed } = body

    if (!exerciseId || !setNumber) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const setLog = await appendSetToWorkout(id, {
      exerciseId,
      setNumber,
      reps,
      weight,
      duration,
      distance,
      completed,
    }, user)

    return NextResponse.json(setLog, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Workout log not found' || error.message === 'Access denied') {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    console.error('Append set error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
