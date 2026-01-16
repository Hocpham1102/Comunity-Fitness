import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()
        const { searchParams } = new URL(request.url)
        const workoutId = searchParams.get('workoutId')

        if (!workoutId) {
            return NextResponse.json({ message: 'Missing workoutId' }, { status: 400 })
        }

        // Find incomplete workout log for this workout
        const existingLog = await db.workoutLog.findFirst({
            where: {
                userId: user.id,
                workoutId,
                completedAt: null,
            },
            select: {
                id: true,
                title: true,
                startedAt: true,
                updatedAt: true,
                currentExerciseOrder: true,
                currentSetNumber: true,
            },
            orderBy: {
                startedAt: 'desc',
            },
        })

        return NextResponse.json({ existingLog }, { status: 200 })
    } catch (error) {
        console.error('Check workout log error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
