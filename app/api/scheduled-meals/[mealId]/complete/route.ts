import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// POST /api/scheduled-meals/[mealId]/complete - Hoàn thành bữa ăn đã lên lịch
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ mealId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { mealId } = await params

        // Get scheduled meal with food details
        const scheduledMeal = await db.scheduledMeal.findUnique({
            where: { id: mealId },
            include: {
                food: true,
                schedule: true,
            },
        })

        if (!scheduledMeal) {
            return NextResponse.json({ error: 'Scheduled meal not found' }, { status: 404 })
        }

        // Verify user owns this schedule
        if (scheduledMeal.schedule.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if already completed
        if (scheduledMeal.isCompleted) {
            return NextResponse.json(
                { error: 'Meal already completed' },
                { status: 400 }
            )
        }

        // Check if scheduled date is today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const scheduledDate = new Date(scheduledMeal.scheduledDate)

        if (scheduledDate < today || scheduledDate >= tomorrow) {
            return NextResponse.json(
                { error: 'Can only complete meals on scheduled date' },
                { status: 400 }
            )
        }

        // Calculate nutrition values based on quantity
        const multiplier = scheduledMeal.quantity / 100
        const calories = scheduledMeal.food.calories * multiplier
        const protein = scheduledMeal.food.protein * multiplier
        const carbs = scheduledMeal.food.carbs * multiplier
        const fats = scheduledMeal.food.fats * multiplier

        // Create nutrition log and update scheduled meal in a transaction
        const [nutritionLog, updatedScheduledMeal] = await db.$transaction([
            db.nutritionLog.create({
                data: {
                    userId: session.user.id,
                    foodId: scheduledMeal.foodId,
                    mealType: scheduledMeal.mealType,
                    quantity: scheduledMeal.quantity,
                    calories,
                    protein,
                    carbs,
                    fats,
                    notes: scheduledMeal.notes,
                    consumedAt: new Date(),
                },
                include: {
                    food: true,
                },
            }),
            db.scheduledMeal.update({
                where: { id: mealId },
                data: { isCompleted: true },
                include: {
                    food: true,
                    schedule: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
        ])

        return NextResponse.json({
            nutritionLog,
            scheduledMeal: updatedScheduledMeal,
        })
    } catch (error) {
        console.error('Error completing scheduled meal:', error)
        return NextResponse.json(
            { error: 'Failed to complete meal' },
            { status: 500 }
        )
    }
}
