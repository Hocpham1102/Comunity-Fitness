/**
 * Meal Plan Assignment Service
 * Handles assigning meal plans to clients and creating schedules
 */

import { db } from '@/lib/server/db/prisma'
import { ScheduleType } from '@prisma/client'
import { getMealPlanById } from './meal-plans.service'
import { addDays, addWeeks, addMonths } from 'date-fns'
import { createNotification } from './notification.service'

export interface CreateScheduleFromPlanInput {
    planId: string
    clientId: string
    trainerId: string
    scheduleType: ScheduleType
    startDate: Date
    endDate?: Date
    name?: string
    description?: string
}

/**
 * Assign a meal plan to a client (creates notification)
 */
export async function assignMealPlanToClient(
    planId: string,
    clientId: string,
    trainerId: string
) {
    // Verify the plan exists and trainer owns it
    const plan = await getMealPlanById(planId, trainerId)
    if (!plan) {
        throw new Error('Meal plan not found')
    }

    // Verify client relationship exists
    const relationship = await db.trainerClient.findUnique({
        where: {
            trainerId_clientId: {
                trainerId,
                clientId,
            },
        },
    })

    if (!relationship) {
        throw new Error('Client relationship not found')
    }

    // Create notification for the client
    await createNotification({
        userId: clientId,
        type: 'MEAL_PLAN_ASSIGNED',
        title: 'New Meal Plan',
        message: `Your trainer has assigned the meal plan: ${plan.name}`,
        link: `/nutrition`, // Link to nutrition page where they can view schedules
    })

    return { success: true, message: 'Meal plan assigned successfully' }
}

/**
 * Create a meal schedule from a meal plan
 */
export async function createScheduleFromPlan(input: CreateScheduleFromPlanInput) {
    const { planId, clientId, trainerId, scheduleType, startDate, endDate, name, description } = input

    // Verify the plan exists and trainer owns it
    const plan = await getMealPlanById(planId, trainerId)
    if (!plan) {
        throw new Error('Meal plan not found')
    }

    // Verify client relationship
    const relationship = await db.trainerClient.findUnique({
        where: {
            trainerId_clientId: {
                trainerId,
                clientId,
            },
        },
    })

    if (!relationship) {
        throw new Error('Client relationship not found')
    }

    // Calculate end date if not provided
    let calculatedEndDate = endDate
    if (!calculatedEndDate) {
        switch (scheduleType) {
            case 'WEEKLY':
                calculatedEndDate = addWeeks(startDate, 4) // 4 weeks default
                break
            case 'MONTHLY':
                calculatedEndDate = addMonths(startDate, 3) // 3 months default
                break
            case 'YEARLY':
                calculatedEndDate = addMonths(startDate, 12) // 1 year default
                break
        }
    }

    // Create the meal schedule
    const schedule = await db.mealSchedule.create({
        data: {
            userId: clientId,
            name: name || `${plan.name} Schedule`,
            description: description || `Meal schedule based on ${plan.name}`,
            scheduleType,
            startDate,
            endDate: calculatedEndDate,
            isActive: true,
        },
    })

    // Generate scheduled meals based on schedule type
    const scheduledMeals = await generateScheduledMeals(
        schedule.id,
        plan.meals,
        scheduleType,
        startDate,
        calculatedEndDate!
    )

    // Create all scheduled meals
    await db.scheduledMeal.createMany({
        data: scheduledMeals,
    })

    // Create notification
    await createNotification({
        userId: clientId,
        type: 'MEAL_PLAN_ASSIGNED',
        title: 'New Meal Schedule',
        message: `Your trainer has created a meal schedule: ${schedule.name}`,
        link: `/nutrition`,
    })

    return schedule
}

/**
 * Generate scheduled meals based on schedule type and meal plan cycle
 */
async function generateScheduledMeals(
    scheduleId: string,
    planMeals: any[],
    scheduleType: ScheduleType,
    startDate: Date,
    endDate: Date
) {
    const scheduledMeals: any[] = []
    let currentDate = new Date(startDate)

    // Group meals by dayOfCycle
    const mealsByDay = new Map<number, any[]>()
    for (const meal of planMeals) {
        const dayOfCycle = meal.dayOfCycle || 1
        if (!mealsByDay.has(dayOfCycle)) {
            mealsByDay.set(dayOfCycle, [])
        }
        mealsByDay.get(dayOfCycle)!.push(meal)
    }

    // Get the cycle length (max dayOfCycle value)
    const cycleDays = Math.max(...Array.from(mealsByDay.keys()))

    // Generate scheduled meals
    while (currentDate <= endDate) {
        // Calculate which day of the cycle we're on
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
        const dayOfCycle = (daysSinceStart % cycleDays) + 1

        // Add meals for this day of the cycle
        const mealsForToday = mealsByDay.get(dayOfCycle) || []
        for (const meal of mealsForToday) {
            scheduledMeals.push({
                scheduleId,
                foodId: meal.foodId,
                mealType: meal.mealType,
                scheduledDate: new Date(currentDate),
                quantity: meal.quantity,
                notes: null,
                isCompleted: false,
            })
        }

        // Move to next day
        currentDate = addDays(currentDate, 1)
    }

    return scheduledMeals
}

/**
 * Get all meal schedules for a client
 */
export async function getClientSchedules(clientId: string) {
    return await db.mealSchedule.findMany({
        where: {
            userId: clientId,
        },
        include: {
            scheduledMeals: {
                include: {
                    food: true,
                },
                orderBy: {
                    scheduledDate: 'asc',
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

/**
 * Get active meal schedules for a client
 */
export async function getActiveClientSchedules(clientId: string) {
    const now = new Date()

    return await db.mealSchedule.findMany({
        where: {
            userId: clientId,
            isActive: true,
            startDate: { lte: now },
            OR: [
                { endDate: null },
                { endDate: { gte: now } },
            ],
        },
        include: {
            scheduledMeals: {
                include: {
                    food: true,
                },
                where: {
                    scheduledDate: {
                        gte: now,
                    },
                },
                orderBy: {
                    scheduledDate: 'asc',
                },
                take: 20, // Limit to next 20 scheduled meals
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}
