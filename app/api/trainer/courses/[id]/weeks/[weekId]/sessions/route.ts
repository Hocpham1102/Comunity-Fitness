import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

const anyDb = db as any

// POST — add a session (workout and/or meal plan) to a week day
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; weekId: string }> }
) {
    try {
        const { id, weekId } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const course = await anyDb.course.findUnique({ where: { id } })
        if (!course || course.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }
        const week = await anyDb.courseWeek.findUnique({ where: { id: weekId } })
        if (!week || week.courseId !== id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const body = await request.json()
        if (!body.dayNumber) {
            return NextResponse.json({ error: 'dayNumber is required' }, { status: 400 })
        }
        if (!body.workoutId && !body.mealPlanId) {
            return NextResponse.json({ error: 'Either workoutId or mealPlanId is required' }, { status: 400 })
        }

        // Verify workout belongs to trainer (if provided)
        if (body.workoutId) {
            const workout = await db.workout.findUnique({ where: { id: body.workoutId } })
            if (!workout || workout.createdById !== user.id) {
                return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
            }
        }

        // Verify meal plan belongs to trainer (if provided)
        if (body.mealPlanId) {
            const mealPlan = await db.mealPlan.findUnique({ where: { id: body.mealPlanId } })
            if (!mealPlan || mealPlan.createdById !== user.id) {
                return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
            }
        }

        const sessionCount = await anyDb.courseSession.count({ where: { weekId } })

        const session = await anyDb.courseSession.create({
            data: {
                weekId,
                workoutId: body.workoutId ?? null,
                mealPlanId: body.mealPlanId ?? null,
                dayNumber: Number(body.dayNumber),
                order: sessionCount,
                title: body.title ?? null,
                notes: body.notes ?? null,
            },
            include: {
                workout: {
                    select: {
                        id: true, name: true, difficulty: true,
                        estimatedTime: true, _count: { select: { exercises: true } },
                    },
                },
                mealPlan: {
                    select: {
                        id: true, name: true, targetCalories: true,
                        targetProtein: true, targetCarbs: true, targetFats: true,
                    },
                },
            },
        })

        return NextResponse.json(session, { status: 201 })
    } catch (error: any) {
        console.error('Add course session error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}
