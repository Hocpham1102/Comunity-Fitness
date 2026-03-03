import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { z } from 'zod'

const urlOrRelativePath = z.union([
    z.string().url(),
    z.string().startsWith('/'),
    z.literal(''),
    z.null(),
])

const courseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    shortDescription: z.string().nullable().optional(),
    category: z.enum([
        'STRENGTH_TRAINING', 'CARDIO', 'YOGA', 'PILATES', 'HIIT',
        'BODYBUILDING', 'WEIGHT_LOSS', 'FLEXIBILITY', 'SPORTS_SPECIFIC', 'GENERAL_FITNESS'
    ]),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
    price: z.number().min(0),
    currency: z.string().default('USD'),
    thumbnailUrl: urlOrRelativePath.optional(),
    previewVideoUrl: urlOrRelativePath.optional(),
    isPublished: z.boolean().default(false),
    duration: z.number().int().positive().optional().nullable(),
})

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || undefined
        const isPublished = searchParams.get('isPublished')
        const q = searchParams.get('q') || ''

        const where: any = { trainerId: user.id }
        if (category && category !== 'all') where.category = category
        if (isPublished === 'true') where.isPublished = true
        if (isPublished === 'false') where.isPublished = false
        if (q) where.title = { contains: q, mode: 'insensitive' }

        const [courses, total] = await Promise.all([
            db.course.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { enrollments: true } },
                    weeks: {
                        select: {
                            id: true,
                            weekNumber: true,
                            _count: { select: { sessions: true } },
                        },
                    },
                } as any,
            }),
            db.course.count({ where }),
        ])

        return NextResponse.json({
            courses: (courses as any[]).map(c => ({
                ...c,
                enrollmentCount: c._count.enrollments,
                weekCount: c.weeks.length,
                sessionCount: c.weeks.reduce((sum: number, w: any) => sum + w._count.sessions, 0),
            })),
            total,
        })

    } catch (error) {
        console.error('List trainer courses error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await request.json()
        const data = courseSchema.parse(body)

        const course = await db.course.create({
            data: {
                trainerId: user.id,
                title: data.title,
                description: data.description,
                shortDescription: data.shortDescription,
                category: data.category,
                difficulty: data.difficulty,
                price: data.price,
                currency: data.currency,
                thumbnailUrl: data.thumbnailUrl || null,
                previewVideoUrl: data.previewVideoUrl || null,
                isPublished: data.isPublished,
                duration: data.duration ?? null,
            },
        })

        return NextResponse.json(course, { status: 201 })
    } catch (error: any) {
        if (error?.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
        }
        console.error('Create trainer course error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
