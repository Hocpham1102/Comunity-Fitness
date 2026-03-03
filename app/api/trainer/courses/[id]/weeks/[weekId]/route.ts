import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

const anyDb = db as any

async function getWeekAndVerify(courseId: string, weekId: string, trainerId: string) {
    const course = await anyDb.course.findUnique({ where: { id: courseId } })
    if (!course || course.trainerId !== trainerId) return null
    const week = await anyDb.courseWeek.findUnique({ where: { id: weekId } })
    if (!week || week.courseId !== courseId) return null
    return week
}

// PUT — update week title/description
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; weekId: string }> }
) {
    try {
        const { id, weekId } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const week = await getWeekAndVerify(id, weekId, user.id)
        if (!week) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const body = await request.json()
        const updated = await anyDb.courseWeek.update({
            where: { id: weekId },
            data: {
                title: body.title !== undefined ? body.title : week.title,
                description: body.description !== undefined ? body.description : week.description,
            },
            include: {
                sessions: {
                    include: {
                        workout: { select: { id: true, name: true, difficulty: true, estimatedTime: true } },
                    },
                    orderBy: { dayNumber: 'asc' },
                },
            },
        })
        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Update course week error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}

// DELETE — delete a week (manually cascade sessions first)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; weekId: string }> }
) {
    try {
        const { id, weekId } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const week = await getWeekAndVerify(id, weekId, user.id)
        if (!week) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Manual cascade: sessions first
        await anyDb.courseSession.deleteMany({ where: { weekId } })
        await anyDb.courseWeek.delete({ where: { id: weekId } })

        // Re-number remaining weeks
        const remaining = await anyDb.courseWeek.findMany({
            where: { courseId: id },
            orderBy: { weekNumber: 'asc' },
        })
        for (let i = 0; i < remaining.length; i++) {
            await anyDb.courseWeek.update({
                where: { id: remaining[i].id },
                data: { weekNumber: i + 1 },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete course week error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}
