import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { assignMealPlanToClient } from '@/lib/server/services/meal-plan-assignment.service'

/**
 * POST /api/trainer/meal-plans/[id]/assign
 * Assign a meal plan to a client
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized: Trainer access required' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()

        if (!body.clientId) {
            return NextResponse.json(
                { error: 'clientId is required' },
                { status: 400 }
            )
        }

        const result = await assignMealPlanToClient(
            id,
            body.clientId,
            session.user.id
        )

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error assigning meal plan:', error)
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to assign meal plan' },
            { status: 500 }
        )
    }
}
