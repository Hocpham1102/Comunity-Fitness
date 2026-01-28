import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getNutritionTargets } from '@/lib/server/services/nutrition-targets.service'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const targets = await getNutritionTargets(session.user.id)

        if (!targets) {
            return NextResponse.json(
                { error: 'Profile not found or incomplete' },
                { status: 404 }
            )
        }

        return NextResponse.json(targets)
    } catch (error) {
        console.error('Error fetching nutrition targets:', error)
        return NextResponse.json(
            { error: 'Failed to fetch nutrition targets' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { targetCalories, targetProtein, targetCarbs, targetFats, useCustomTargets } = body

        // Validate input
        if (
            typeof targetCalories !== 'number' ||
            typeof targetProtein !== 'number' ||
            typeof targetCarbs !== 'number' ||
            typeof targetFats !== 'number'
        ) {
            return NextResponse.json({ error: 'Invalid target values' }, { status: 400 })
        }

        const { updateNutritionTargets } = await import(
            '@/lib/server/services/nutrition-targets.service'
        )

        await updateNutritionTargets(
            session.user.id,
            {
                targetCalories,
                targetProtein,
                targetCarbs,
                targetFats,
            },
            useCustomTargets ?? true
        )

        return NextResponse.json({
            message: 'Nutrition targets updated successfully',
            targets: {
                targetCalories,
                targetProtein,
                targetCarbs,
                targetFats,
            },
        })
    } catch (error) {
        console.error('Error updating nutrition targets:', error)
        return NextResponse.json(
            { error: 'Failed to update nutrition targets' },
            { status: 500 }
        )
    }
}
