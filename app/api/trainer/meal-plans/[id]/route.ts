import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan,
    type UpdateMealPlanInput,
} from '@/lib/server/services/meal-plans.service'

/**
 * GET /api/trainer/meal-plans/[id]
 * Get meal plan details
 */
export async function GET(
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
        const mealPlan = await getMealPlanById(id, session.user.id)

        if (!mealPlan) {
            return NextResponse.json(
                { error: 'Meal plan not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(mealPlan)
    } catch (error: any) {
        console.error('Error fetching meal plan:', error)
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to fetch meal plan' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/trainer/meal-plans/[id]
 * Update meal plan
 */
export async function PUT(
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
        const data: UpdateMealPlanInput = {
            name: body.name,
            description: body.description,
            targetCalories: body.targetCalories,
            targetProtein: body.targetProtein,
            targetCarbs: body.targetCarbs,
            targetFats: body.targetFats,
            isPublic: body.isPublic,
        }

        const mealPlan = await updateMealPlan(id, session.user.id, data)

        return NextResponse.json(mealPlan)
    } catch (error: any) {
        console.error('Error updating meal plan:', error)
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to update meal plan' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/trainer/meal-plans/[id]
 * Delete meal plan
 */
export async function DELETE(
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
        await deleteMealPlan(id, session.user.id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting meal plan:', error)
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to delete meal plan' },
            { status: 500 }
        )
    }
}
