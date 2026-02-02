import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
    getMealPlans,
    createMealPlan,
    type CreateMealPlanInput,
} from '@/lib/server/services/meal-plans.service'

/**
 * GET /api/trainer/meal-plans
 * Get all meal plans for authenticated trainer
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized: Trainer access required' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const search = searchParams.get('search') || undefined

        const result = await getMealPlans(session.user.id, {
            page,
            pageSize,
            search,
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching meal plans:', error)
        return NextResponse.json(
            { error: 'Failed to fetch meal plans' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/trainer/meal-plans
 * Create a new meal plan
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized: Trainer access required' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const data: CreateMealPlanInput = {
            name: body.name,
            description: body.description,
            targetCalories: body.targetCalories,
            targetProtein: body.targetProtein,
            targetCarbs: body.targetCarbs,
            targetFats: body.targetFats,
            isPublic: body.isPublic ?? false,
        }

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        const mealPlan = await createMealPlan(session.user.id, data)

        return NextResponse.json(mealPlan, { status: 201 })
    } catch (error) {
        console.error('Error creating meal plan:', error)
        return NextResponse.json(
            { error: 'Failed to create meal plan' },
            { status: 500 }
        )
    }
}
