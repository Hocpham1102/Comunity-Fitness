import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { addMealToPlan, type AddMealToPlanInput } from '@/lib/server/services/meal-plans.service'
import { MealType } from '@prisma/client'

/**
 * POST /api/trainer/meal-plans/[id]/meals
 * Add a meal to a meal plan
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

        // Validate input
        if (!body.foodId || !body.mealType || !body.quantity) {
            return NextResponse.json(
                { error: 'foodId, mealType, and quantity are required' },
                { status: 400 }
            )
        }

        const meal: AddMealToPlanInput = {
            foodId: body.foodId,
            mealType: body.mealType as MealType,
            quantity: parseFloat(body.quantity),
            dayOfCycle: body.dayOfCycle ? parseInt(body.dayOfCycle) : undefined,
            order: body.order ? parseInt(body.order) : undefined,
        }

        const addedMeal = await addMealToPlan(id, session.user.id, meal)

        return NextResponse.json(addedMeal, { status: 201 })
    } catch (error: any) {
        console.error('Error adding meal to plan:', error)
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to add meal to plan' },
            { status: 500 }
        )
    }
}
