import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'

export async function GET(
    request: Request,
    { params }: { params: { trainerId: string } }
) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const difficulty = searchParams.get('difficulty')

        // Build where clause
        const where = {
            trainerId: params.trainerId,
            isPublished: true,
            ...(category && { category: category as any }),
            ...(difficulty && { difficulty: difficulty as any }),
        }

        const courses = await db.course.findMany({
            where,
            include: {
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({
            courses: courses.map((course) => ({
                ...course,
                enrollmentCount: course._count.enrollments,
            })),
        })
    } catch (error) {
        console.error('Error fetching trainer courses:', error)
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        )
    }
}
