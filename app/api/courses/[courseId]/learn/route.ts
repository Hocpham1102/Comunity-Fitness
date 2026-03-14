import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { verifySession } from '@/lib/server/auth/session'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { user } = await verifySession()
        const { courseId } = await params

        // Verify enrollment
        const enrollment = await (db as any).courseEnrollment.findUnique({
            where: { courseId_userId: { courseId, userId: user.id } },
            select: { id: true },
        })

        if (!enrollment) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
        }

        const course = await (db as any).course.findUnique({
            where: { id: courseId },
            include: {
                trainer: {
                    select: { id: true, name: true, image: true },
                },
                weeks: {
                    orderBy: { weekNumber: 'asc' },
                    include: {
                        sessions: {
                            orderBy: { dayNumber: 'asc' },
                            include: {
                                workout: {
                                    select: {
                                        id: true, name: true, difficulty: true, estimatedTime: true,
                                        _count: { select: { exercises: true } },
                                    },
                                },
                                mealPlan: {
                                    select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        targetCalories: true,
                                        targetProtein: true,
                                        targetCarbs: true,
                                        targetFats: true,
                                        cycleDays: true,
                                        meals: {
                                            include: {
                                                food: {
                                                    select: {
                                                        id: true, name: true,
                                                        calories: true, protein: true,
                                                        carbs: true, fats: true,
                                                    },
                                                },
                                            },
                                            orderBy: [{ dayOfCycle: 'asc' }, { order: 'asc' }],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        return NextResponse.json(course)
    } catch (error: any) {
        if (error?.message === 'Unauthorized' || error?.status === 401) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.error('Course learn error:', error)
        return NextResponse.json({ error: 'Failed to fetch course content' }, { status: 500 })
    }
}
