import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getNutritionStats } from '@/lib/server/services/nutrition-logs.service'
import { getNutritionTargets } from '@/lib/server/services/nutrition-targets.service'

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

        const [stats, targets] = await Promise.all([
            getNutritionStats(session.user.id, startDate, endDate),
            getNutritionTargets(session.user.id),
        ])

        return NextResponse.json({
            ...stats,
            targets: targets || {
                targetCalories: 2000,
                targetProtein: 150,
                targetCarbs: 200,
                targetFats: 65,
            },
        })
    } catch (error) {
        console.error('Error fetching nutrition stats:', error)
        return NextResponse.json({ error: 'Failed to fetch nutrition stats' }, { status: 500 })
    }
}
