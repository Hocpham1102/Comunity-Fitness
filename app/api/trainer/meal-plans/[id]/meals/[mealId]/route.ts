import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { removeMealFromPlan } from '@/lib/server/services/meal-plans.service'

/**
 * DELETE /api/trainer/meal-plans/[id]/meals/[mealId]
 * Remove a meal from a meal plan
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; mealId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized: Trainer access required' },
                { status: 401 }
            )
        }

        const { id, mealId } = await params
        await removeMealFromPlan(id, mealId, session.user.id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error removing meal from plan:', error)
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to remove meal from plan' },
            { status: 500 }
        )
    }
}
