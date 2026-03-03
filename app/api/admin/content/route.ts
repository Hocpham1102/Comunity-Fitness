import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// GET /api/admin/content — list pending/all content (exercises + workouts by trainers)
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = request.nextUrl
        const type = searchParams.get('type') || 'all' // exercise | workout | all
        const status = searchParams.get('status') || 'PENDING'
        const trainerId = searchParams.get('trainerId') || undefined
        const q = searchParams.get('q') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20'))

        const trainerFilter = { role: 'TRAINER' as const }

        // Build shared where clauses
        const buildWhere = (extra: Record<string, any> = {}) => {
            const where: any = {
                createdBy: trainerFilter,
                ...extra,
            }
            if (status !== 'all') where.approvalStatus = status
            if (trainerId) where.createdById = trainerId
            if (q) where.name = { contains: q, mode: 'insensitive' }
            return where
        }

        let exercises: any[] = []
        let workouts: any[] = []
        let exerciseCount = 0
        let workoutCount = 0

        if (type === 'all' || type === 'exercise') {
            const where = buildWhere()
            const [rows, count] = await Promise.all([
                db.exercise.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { id: true, name: true, email: true } }
                    }
                }),
                db.exercise.count({ where })
            ])
            exercises = rows.map(e => ({ ...e, contentType: 'exercise' }))
            exerciseCount = count
        }

        if (type === 'all' || type === 'workout') {
            const where = buildWhere()
            const [rows, count] = await Promise.all([
                db.workout.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { id: true, name: true, email: true } }
                    }
                }),
                db.workout.count({ where })
            ])
            workouts = rows.map(w => ({ ...w, contentType: 'workout' }))
            workoutCount = count
        }

        // Combine, sort by date desc, then paginate
        const combined = [...exercises, ...workouts].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        const total = exerciseCount + workoutCount
        const skip = (page - 1) * pageSize
        const items = combined.slice(skip, skip + pageSize)

        return NextResponse.json({ items, total, page, pageSize })
    } catch (error) {
        console.error('Error fetching content:', error)
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }
}

// PATCH /api/admin/content — approve or reject an item
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id, contentType, approvalStatus, rejectionReason } = body

        if (!id || !contentType || !approvalStatus) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const data: any = {
            approvalStatus,
            rejectionReason: approvalStatus === 'REJECTED' ? (rejectionReason || null) : null,
            approvedAt: approvalStatus === 'APPROVED' ? new Date() : null,
        }

        if (contentType === 'exercise') {
            // Also make public when approved
            if (approvalStatus === 'APPROVED') data.isPublic = true
            await db.exercise.update({ where: { id }, data })
        } else if (contentType === 'workout') {
            if (approvalStatus === 'APPROVED') data.isPublic = true
            await db.workout.update({ where: { id }, data })
        } else {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating content:', error)
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
    }
}
