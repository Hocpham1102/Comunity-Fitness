import { db } from '@/lib/server/db/prisma'

export interface SearchFoodsParams {
    q?: string
    page?: number
    pageSize?: number
    isPublic?: boolean
}

export interface CreateFoodData {
    name: string
    description?: string
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber?: number
    sugar?: number
    servingSize?: number
    servingUnit?: string
    isPublic?: boolean
}

export interface UpdateFoodData {
    name?: string
    description?: string
    calories?: number
    protein?: number
    carbs?: number
    fats?: number
    fiber?: number
    sugar?: number
    servingSize?: number
    servingUnit?: string
    isPublic?: boolean
}

export async function searchFoods(params: SearchFoodsParams) {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
    const skip = (page - 1) * pageSize

    const where: any = {}

    // Text search
    if (params.q) {
        where.name = {
            contains: params.q,
            mode: 'insensitive',
        }
    }

    // Public filter
    if (params.isPublic !== undefined) {
        where.isPublic = params.isPublic
    } else {
        // Default to public only
        where.isPublic = true
    }

    const [items, total] = await Promise.all([
        db.food.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: pageSize,
        }),
        db.food.count({ where }),
    ])

    return { items, total, page, pageSize }
}

export async function getFoodById(id: string) {
    return db.food.findUnique({
        where: { id },
    })
}

export async function createFood(data: CreateFoodData, userId?: string) {
    return db.food.create({
        data: {
            name: data.name,
            description: data.description,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fats: data.fats,
            fiber: data.fiber,
            sugar: data.sugar,
            servingSize: data.servingSize,
            servingUnit: data.servingUnit,
            isPublic: data.isPublic ?? true,
            createdById: userId,
        },
    })
}

export async function updateFood(id: string, data: UpdateFoodData, userRole?: string) {
    const existing = await db.food.findUnique({ where: { id } })
    if (!existing) return null

    // Only admins can update foods
    if (userRole !== 'ADMIN') return null

    return db.food.update({
        where: { id },
        data: {
            name: data.name ?? existing.name,
            description: data.description ?? existing.description,
            calories: data.calories ?? existing.calories,
            protein: data.protein ?? existing.protein,
            carbs: data.carbs ?? existing.carbs,
            fats: data.fats ?? existing.fats,
            fiber: data.fiber ?? existing.fiber,
            sugar: data.sugar ?? existing.sugar,
            servingSize: data.servingSize ?? existing.servingSize,
            servingUnit: data.servingUnit ?? existing.servingUnit,
            isPublic: data.isPublic ?? existing.isPublic,
        },
    })
}

export async function deleteFood(id: string, userRole?: string) {
    const existing = await db.food.findUnique({ where: { id } })
    if (!existing) return false

    // Only admins can delete foods
    if (userRole !== 'ADMIN') return false

    await db.food.delete({ where: { id } })
    return true
}

export async function listFoods(params: SearchFoodsParams) {
    return searchFoods(params)
}
