import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getNutritionStats } from '@/lib/server/services/nutrition-logs.service'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const startDateStr = searchParams.get('startDate')
        const endDateStr = searchParams.get('endDate')

        const startDate = startDateStr ? new Date(startDateStr) : new Date()
        const endDate = endDateStr ? new Date(endDateStr) : new Date()

        const stats = await getNutritionStats(session.user.id, startDate, endDate)
        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching nutrition stats:', error)
        return NextResponse.json({ error: 'Failed to fetch nutrition stats' }, { status: 500 })
    }
}
