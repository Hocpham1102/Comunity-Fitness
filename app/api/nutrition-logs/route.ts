import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUserNutritionLogs, createNutritionLog } from '@/lib/server/services/nutrition-logs.service'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const dateStr = searchParams.get('date')
        const date = dateStr ? new Date(dateStr) : new Date()

        const logs = await getUserNutritionLogs(session.user.id, date)
        return NextResponse.json(logs)
    } catch (error) {
        console.error('Error fetching nutrition logs:', error)
        return NextResponse.json({ error: 'Failed to fetch nutrition logs' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const log = await createNutritionLog(session.user.id, data)
        return NextResponse.json(log, { status: 201 })
    } catch (error) {
        console.error('Error creating nutrition log:', error)
        return NextResponse.json({ error: 'Failed to create nutrition log' }, { status: 500 })
    }
}
