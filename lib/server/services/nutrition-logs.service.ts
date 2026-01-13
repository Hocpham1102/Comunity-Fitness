import { db } from '@/lib/server/db/prisma'
import { MealType } from '@prisma/client'

export interface CreateNutritionLogData {
    foodId: string
    mealType: MealType
    quantity: number // in grams
    notes?: string
    consumedAt?: Date
}

export interface UpdateNutritionLogData {
    mealType?: MealType
    quantity?: number
    notes?: string
    consumedAt?: Date
}

export interface NutritionStats {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFats: number
    mealCount: number
}

export async function createNutritionLog(userId: string, data: CreateNutritionLogData) {
    // Get food to calculate nutrition values
    const food = await db.food.findUnique({
        where: { id: data.foodId },
    })

    if (!food) {
        throw new Error('Food not found')
    }

    // Calculate nutrition based on quantity (food values are per 100g)
    const multiplier = data.quantity / 100
    const calories = food.calories * multiplier
    const protein = food.protein * multiplier
    const carbs = food.carbs * multiplier
    const fats = food.fats * multiplier

    return db.nutritionLog.create({
        data: {
            userId,
            foodId: data.foodId,
            mealType: data.mealType,
            quantity: data.quantity,
            calories,
            protein,
            carbs,
            fats,
            notes: data.notes,
            consumedAt: data.consumedAt ?? new Date(),
        },
        include: {
            food: true,
        },
    })
}

export async function updateNutritionLog(id: string, userId: string, data: UpdateNutritionLogData) {
    const existing = await db.nutritionLog.findUnique({
        where: { id },
        include: { food: true },
    })

    if (!existing || existing.userId !== userId) {
        return null
    }

    // Recalculate nutrition if quantity changed
    let calories = existing.calories
    let protein = existing.protein
    let carbs = existing.carbs
    let fats = existing.fats

    if (data.quantity && data.quantity !== existing.quantity) {
        const multiplier = data.quantity / 100
        calories = existing.food.calories * multiplier
        protein = existing.food.protein * multiplier
        carbs = existing.food.carbs * multiplier
        fats = existing.food.fats * multiplier
    }

    return db.nutritionLog.update({
        where: { id },
        data: {
            mealType: data.mealType ?? existing.mealType,
            quantity: data.quantity ?? existing.quantity,
            calories,
            protein,
            carbs,
            fats,
            notes: data.notes ?? existing.notes,
            consumedAt: data.consumedAt ?? existing.consumedAt,
        },
        include: {
            food: true,
        },
    })
}

export async function deleteNutritionLog(id: string, userId: string) {
    const existing = await db.nutritionLog.findUnique({
        where: { id },
    })

    if (!existing || existing.userId !== userId) {
        return false
    }

    await db.nutritionLog.delete({ where: { id } })
    return true
}

export async function getUserNutritionLogs(userId: string, date?: Date) {
    const targetDate = date ?? new Date()

    // Start of day
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    // End of day
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    return db.nutritionLog.findMany({
        where: {
            userId,
            consumedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            food: true,
        },
        orderBy: {
            consumedAt: 'asc',
        },
    })
}

export async function getNutritionStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
): Promise<NutritionStats> {
    const start = startDate ?? new Date()
    start.setHours(0, 0, 0, 0)

    const end = endDate ?? new Date()
    end.setHours(23, 59, 59, 999)

    const logs = await db.nutritionLog.findMany({
        where: {
            userId,
            consumedAt: {
                gte: start,
                lte: end,
            },
        },
    })

    const stats = logs.reduce(
        (acc, log) => ({
            totalCalories: acc.totalCalories + log.calories,
            totalProtein: acc.totalProtein + log.protein,
            totalCarbs: acc.totalCarbs + log.carbs,
            totalFats: acc.totalFats + log.fats,
            mealCount: acc.mealCount + 1,
        }),
        {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
            mealCount: 0,
        }
    )

    return stats
}
