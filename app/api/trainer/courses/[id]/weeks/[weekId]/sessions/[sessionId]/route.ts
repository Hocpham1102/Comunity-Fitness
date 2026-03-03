import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

const anyDb = db as any

// DELETE — remove a session from a week
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; weekId: string; sessionId: string }> }
) {
    try {
        const { id, weekId, sessionId } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const course = await anyDb.course.findUnique({ where: { id } })
        if (!course || course.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const session = await anyDb.courseSession.findUnique({ where: { id: sessionId } })
        if (!session || session.weekId !== weekId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        await anyDb.courseSession.delete({ where: { id: sessionId } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete course session error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}

// PUT — update session notes/title
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; weekId: string; sessionId: string }> }
) {
    try {
        const { id, weekId, sessionId } = await params
        const { user } = await verifySession()
        if (user.role !== 'TRAINER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const course = await anyDb.course.findUnique({ where: { id } })
        if (!course || course.trainerId !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const session = await anyDb.courseSession.findUnique({ where: { id: sessionId } })
        if (!session || session.weekId !== weekId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const body = await request.json()
        const updated = await anyDb.courseSession.update({
            where: { id: sessionId },
            data: {
                title: body.title !== undefined ? body.title : session.title,
                notes: body.notes !== undefined ? body.notes : session.notes,
                dayNumber: body.dayNumber !== undefined ? Number(body.dayNumber) : session.dayNumber,
            },
            include: {
                workout: { select: { id: true, name: true, difficulty: true, estimatedTime: true } },
            },
        })
        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Update course session error:', error?.message ?? error)
        return NextResponse.json({ error: error?.message ?? 'Internal server error' }, { status: 500 })
    }
}
