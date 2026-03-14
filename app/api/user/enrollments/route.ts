import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { verifySession } from '@/lib/server/auth/session'

export async function GET(_request: NextRequest) {
    try {
        const { user } = await verifySession()

        const enrollments = await (db as any).courseEnrollment.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    include: {
                        trainer: {
                            select: { id: true, name: true, image: true },
                        },
                        _count: { select: { weeks: true } },
                    },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        })

        return NextResponse.json({
            enrollments: enrollments.map((e: any) => ({
                id: e.id,
                enrolledAt: e.enrolledAt,
                completedAt: e.completedAt,
                progress: e.progress,
                course: {
                    id: e.course.id,
                    title: e.course.title,
                    shortDescription: e.course.shortDescription,
                    category: e.course.category,
                    difficulty: e.course.difficulty,
                    thumbnailUrl: e.course.thumbnailUrl,
                    duration: e.course.duration,
                    weekCount: e.course._count.weeks,
                    trainer: e.course.trainer,
                },
            })),
        })
    } catch (error: any) {
        if (error?.message === 'Unauthorized' || error?.status === 401) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.error('Get enrollments error:', error)
        return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
    }
}
