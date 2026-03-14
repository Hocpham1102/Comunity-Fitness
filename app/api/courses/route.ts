import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const category = searchParams.get('category') || ''
        const difficulty = searchParams.get('difficulty') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
        const skip = (page - 1) * limit

        const where: any = {
            isPublished: true,
            // Only show courses from admin-verified trainers
            trainer: {
                trainerProfile: { isVerified: true },
            },
            ...(category && { category }),
            ...(difficulty && { difficulty }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { shortDescription: { contains: search, mode: 'insensitive' } },
                ],
            }),
        }

        const [courses, total] = await Promise.all([
            db.course.findMany({
                where,
                include: {
                    trainer: {
                        select: { id: true, name: true, image: true },
                    },
                    _count: { select: { enrollments: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            db.course.count({ where }),
        ])

        // Check enrollment status if user is logged in
        let enrolledCourseIds = new Set<string>()
        const session = await auth()
        if (session?.user?.id) {
            const enrollments = await db.courseEnrollment.findMany({
                where: {
                    userId: session.user.id,
                    courseId: { in: courses.map(c => c.id) }
                },
                select: { courseId: true }
            })
            enrolledCourseIds = new Set(enrollments.map(e => e.courseId))
        }

        return NextResponse.json({
            courses: courses.map((c) => ({
                id: c.id,
                title: c.title,
                shortDescription: c.shortDescription,
                category: c.category,
                difficulty: c.difficulty,
                price: c.price,
                currency: c.currency,
                duration: c.duration,
                thumbnailUrl: c.thumbnailUrl,
                enrollmentCount: c._count.enrollments,
                trainer: c.trainer,
                isEnrolled: enrolledCourseIds.has(c.id),
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('List courses error:', error)
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }
}
