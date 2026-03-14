import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { getSessionOrNull } from '@/lib/server/auth/session'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params
        const session = await getSessionOrNull()
        const userId = session?.user?.id

        const course = await (db as any).course.findFirst({
            where: {
                id: courseId,
                isPublished: true,
                // Only accessible if trainer is admin-verified
                trainer: {
                    trainerProfile: { isVerified: true },
                },
            },
            include: {
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        trainerProfile: {
                            select: {
                                bio: true,
                                specializations: true,
                                yearsExperience: true,
                                websiteUrl: true,
                            },
                        },
                    },
                },
                _count: { select: { enrollments: true } },
                weeks: {
                    orderBy: { weekNumber: 'asc' },
                    include: {
                        sessions: {
                            orderBy: { dayNumber: 'asc' },
                            select: {
                                id: true,
                                dayNumber: true,
                                title: true,
                                notes: true,
                                workoutId: true,
                                mealPlanId: true,
                            },
                        },
                    },
                },
            },
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }


        // Check enrollment if logged in
        let isEnrolled = false
        if (userId) {
            const enrollment = await (db as any).courseEnrollment.findUnique({
                where: { courseId_userId: { courseId, userId } },
                select: { id: true },
            })
            isEnrolled = !!enrollment
        }

        return NextResponse.json({
            id: course.id,
            title: course.title,
            description: course.description,
            shortDescription: course.shortDescription,
            category: course.category,
            difficulty: course.difficulty,
            price: course.price,
            currency: course.currency,
            duration: course.duration,
            thumbnailUrl: course.thumbnailUrl,
            previewVideoUrl: course.previewVideoUrl,
            enrollmentCount: course._count.enrollments,
            trainer: course.trainer,
            weeks: course.weeks,
            isEnrolled,
        })
    } catch (error) {
        console.error('Get course error:', error)
        return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
    }
}
