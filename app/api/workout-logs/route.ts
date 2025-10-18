import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { createWorkoutLog, getWorkoutHistory } from '@/lib/server/services/workout-logs.service'

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifySession()
    const body = await request.json()

    const { workoutId, title, notes } = body

    if (!workoutId || !title) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const log = await createWorkoutLog(user.id, {
      workoutId,
      title,
      notes,
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Workout not found' || error.message === 'Access denied') {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    console.error('Create workout log error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifySession()
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '20')

    const result = await getWorkoutHistory(user.id, page, pageSize)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Get workout history error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
