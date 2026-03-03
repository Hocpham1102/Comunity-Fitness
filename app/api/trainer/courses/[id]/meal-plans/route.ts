import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

const anyDb = db as any

// GET trainer's meal plans for course builder picker
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const course = await anyDb.course.findUnique({ where: { id } })
        if (!course || course.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const q = new URL(request.url).searchParams.get('q') || ''

        const mealPlans = await db.mealPlan.findMany({
            where: {
                createdById: user.id,
                ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
            },
            select: {
                id: true,
                name: true,
                description: true,
                targetCalories: true,
                targetProtein: true,
                targetCarbs: true,
                targetFats: true,
                cycleDays: true,
                _count: { select: { meals: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            mealPlans: mealPlans.map(m => ({ ...m, mealCount: m._count.meals })),
        })
    } catch (error) {
        console.error('Get course meal plans error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
