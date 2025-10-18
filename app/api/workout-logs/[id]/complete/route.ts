import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { completeWorkout } from '@/lib/server/services/workout-logs.service'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { user } = await verifySession()

    const log = await completeWorkout(id, user)

    return NextResponse.json(log, { status: 200 })
  } catch (error: any) {
    if (error.message === 'Workout log not found' || error.message === 'Access denied') {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    console.error('Complete workout error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
