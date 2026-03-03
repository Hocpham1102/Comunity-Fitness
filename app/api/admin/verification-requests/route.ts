import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// GET - list all verification requests (admin only)
export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // PENDING | APPROVED | REJECTED | all
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '20')

    const where = status && status !== 'all' ? { status: status as any } : {}

    const [items, total] = await Promise.all([
        db.trainerVerificationRequest.findMany({
            where,
            orderBy: { submittedAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        }),
        db.trainerVerificationRequest.count({ where }),
    ])

    return NextResponse.json({ items, total })
}
