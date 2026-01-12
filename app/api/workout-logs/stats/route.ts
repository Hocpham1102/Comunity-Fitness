import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { computeWorkoutStats } from '@/lib/server/services/workout-logs.service'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        const stats = await computeWorkoutStats(user.id)
        return NextResponse.json(stats, { status: 200 })
    } catch (error) {
        console.error('Get workout stats error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
