import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

const anyDb = db as any

// POST — add a new week to a course
export async function POST(
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

        // Find the next week number
        const lastWeek = await anyDb.courseWeek.findFirst({
            where: { courseId: id },
            orderBy: { weekNumber: 'desc' },
        })
        const nextWeekNumber = (lastWeek?.weekNumber ?? 0) + 1

        const body = await request.json().catch(() => ({}))

        const week = await anyDb.courseWeek.create({
            data: {
                courseId: id,
                weekNumber: nextWeekNumber,
                title: body.title ?? `Week ${nextWeekNumber}`,
                description: body.description ?? null,
            },
            include: { sessions: true },
        })

        return NextResponse.json(week, { status: 201 })
    } catch (error: any) {
        console.error('Add course week error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}
