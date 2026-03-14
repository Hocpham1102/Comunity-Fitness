import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { verifySession } from '@/lib/server/auth/session'

/**
 * POST /api/courses/[courseId]/add-meal-plan
 * Add a session's meal plan foods to the user's nutrition schedule.
 * Body: { mealPlanId: string, scheduledDate: string (ISO), scheduleId?: string }
 * - If scheduleId is provided, adds to existing schedule
 * - If not, creates a new WEEKLY schedule named after the meal plan
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { user } = await verifySession()
        const { courseId } = await params
        const body = await request.json()
        const { mealPlanId, scheduledDate, scheduleId } = body

        if (!mealPlanId || !scheduledDate) {
            return NextResponse.json(
                { error: 'mealPlanId and scheduledDate are required' },
                { status: 400 }
            )
        }

        // Verify user is enrolled in the course
        const enrollment = await (db as any).courseEnrollment.findUnique({
            where: { courseId_userId: { courseId, userId: user.id } },
            select: { id: true },
        })
        if (!enrollment) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
        }

        // Fetch the meal plan with its foods
        const mealPlan = await db.mealPlan.findUnique({
            where: { id: mealPlanId },
            include: {
                meals: {
                    include: { food: true },
                    orderBy: [{ dayOfCycle: 'asc' }, { order: 'asc' }],
                },
            },
        })

        if (!mealPlan) {
            return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
        }

        if (mealPlan.meals.length === 0) {
            return NextResponse.json(
                { error: 'Meal plan has no foods to schedule' },
                { status: 400 }
            )
        }

        // Determine or create schedule
        let targetScheduleId = scheduleId
        if (!targetScheduleId) {
            // Use UTC midnight so DB datetime comparison is timezone-safe
            const startOfDay = new Date(scheduledDate)
            startOfDay.setUTCHours(0, 0, 0, 0)
            const endOfDay = new Date(scheduledDate)
            endOfDay.setUTCHours(23, 59, 59, 999)

            // Reuse existing schedule with same meal plan name + same day to avoid duplicates
            const existingSchedule = await db.mealSchedule.findFirst({
                where: {
                    userId: user.id,
                    name: mealPlan.name,
                    startDate: { gte: startOfDay, lte: endOfDay },
                },
                select: { id: true },
            })

            if (existingSchedule) {
                targetScheduleId = existingSchedule.id
            } else {
                const newSchedule = await db.mealSchedule.create({
                    data: {
                        userId: user.id,
                        name: mealPlan.name,
                        description: `Imported from course on ${startOfDay.toLocaleDateString()}`,
                        scheduleType: 'WEEKLY',
                        startDate: startOfDay,
                        isActive: true,
                    },
                })
                targetScheduleId = newSchedule.id
            }
        } else {
            // Verify the schedule belongs to the user
            const existingSchedule = await db.mealSchedule.findFirst({
                where: { id: targetScheduleId, userId: user.id },
            })
            if (!existingSchedule) {
                return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
            }
        }

        // Set schedule này là active, unset tất cả cái khác
        await db.mealSchedule.updateMany({
            where: { userId: user.id, isActive: true, NOT: { id: targetScheduleId! } },
            data: { isActive: false },
        })
        await db.mealSchedule.update({
            where: { id: targetScheduleId! },
            data: { isActive: true },
        })

        // Build the list of meals to insert with their target dates
        const baseDate = new Date(scheduledDate)
        const mealsToInsert = mealPlan.meals.map((meal) => {
            const mealDate = new Date(baseDate)
            mealDate.setDate(mealDate.getDate() + (meal.dayOfCycle - 1))
            // Zero out time so date comparison is consistent
            mealDate.setHours(0, 0, 0, 0)
            return {
                scheduleId: targetScheduleId!,
                foodId: meal.foodId,
                mealType: meal.mealType,
                scheduledDate: mealDate,
                quantity: meal.quantity,
            }
        })

        // Delete any existing meals on those dates in this schedule, then replace with the new ones
        const uniqueDates = [...new Set(mealsToInsert.map(m => m.scheduledDate))]
        await db.scheduledMeal.deleteMany({
            where: {
                scheduleId: targetScheduleId!,
                scheduledDate: { in: uniqueDates },
            },
        })

        const result = await db.scheduledMeal.createMany({ data: mealsToInsert })

        return NextResponse.json({
            success: true,
            scheduleId: targetScheduleId,
            addedMeals: result.count,
        })
    } catch (error: any) {
        if (error?.message === 'Unauthorized' || error?.status === 401) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.error('Add meal plan to schedule error:', error)
        return NextResponse.json({ error: 'Failed to add meal plan to schedule' }, { status: 500 })
    }
}
