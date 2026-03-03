import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { z } from 'zod'

const urlOrRelativePath = z.union([
    z.string().url(),           // https://...
    z.string().startsWith('/'), // /uploads/...
    z.literal(''),
])

const courseUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    shortDescription: z.string().optional().nullable(),
    category: z.enum([
        'STRENGTH_TRAINING', 'CARDIO', 'YOGA', 'PILATES', 'HIIT',
        'BODYBUILDING', 'WEIGHT_LOSS', 'FLEXIBILITY', 'SPORTS_SPECIFIC', 'GENERAL_FITNESS'
    ]).optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
    price: z.number().min(0).optional(),
    currency: z.string().optional(),
    thumbnailUrl: urlOrRelativePath.optional().nullable(),
    previewVideoUrl: urlOrRelativePath.optional().nullable(),
    isPublished: z.boolean().optional(),
    duration: z.number().int().positive().optional().nullable(),
})

// Shorthand to avoid TypeScript errors with dynamic Course models
const anyDb = db as any

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const course = await anyDb.course.findUnique({
            where: { id },
            include: {
                _count: { select: { enrollments: true } },
                weeks: {
                    orderBy: { weekNumber: 'asc' },
                    include: {
                        sessions: {
                            orderBy: { dayNumber: 'asc' },
                            include: {
                                workout: {
                                    select: {
                                        id: true, name: true, difficulty: true,
                                        estimatedTime: true,
                                        _count: { select: { exercises: true } },
                                    },
                                },
                                mealPlan: {
                                    select: {
                                        id: true, name: true,
                                        targetCalories: true, targetProtein: true,
                                        targetCarbs: true, targetFats: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!course || course.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json({ ...course, enrollmentCount: course._count.enrollments })
    } catch (error: any) {
        console.error('Get trainer course error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}


export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const existing = await anyDb.course.findUnique({ where: { id } })
        if (!existing || existing.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const body = await request.json()
        const data = courseUpdateSchema.parse(body)

        const updated = await anyDb.course.update({
            where: { id },
            data: {
                title: data.title ?? existing.title,
                description: data.description ?? existing.description,
                shortDescription: data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription,
                category: data.category ?? existing.category,
                difficulty: data.difficulty ?? existing.difficulty,
                price: data.price ?? existing.price,
                currency: data.currency ?? existing.currency,
                thumbnailUrl: data.thumbnailUrl !== undefined ? (data.thumbnailUrl || null) : existing.thumbnailUrl,
                previewVideoUrl: data.previewVideoUrl !== undefined ? (data.previewVideoUrl || null) : existing.previewVideoUrl,
                isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
                duration: data.duration !== undefined ? data.duration : existing.duration,
            },
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
        }
        console.error('Update trainer course error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
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

        // Manual cascade: sessions → weeks → enrollments → course
        const weeks = await anyDb.courseWeek.findMany({ where: { courseId: id } })
        for (const week of weeks) {
            await anyDb.courseSession.deleteMany({ where: { weekId: week.id } })
        }
        await anyDb.courseWeek.deleteMany({ where: { courseId: id } })
        await anyDb.courseEnrollment.deleteMany({ where: { courseId: id } })
        await anyDb.course.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete trainer course error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}
