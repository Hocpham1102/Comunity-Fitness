import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get('page') ?? '1')
        const pageSize = Number(searchParams.get('pageSize') ?? '20')
        const skip = (page - 1) * pageSize

        const [items, total] = await Promise.all([
            db.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    emailVerified: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            db.user.count(),
        ])

        return NextResponse.json({ items, total, page, pageSize }, { status: 200 })
    } catch (error) {
        console.error('Admin users list error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
