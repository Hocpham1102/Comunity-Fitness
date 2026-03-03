import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = request.nextUrl
        const q = searchParams.get('q') || ''
        const isVerifiedParam = searchParams.get('isVerified')
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')

        const where: any = { role: 'TRAINER' }
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ]
        }
        if (isVerifiedParam === 'true') {
            where.trainerProfile = { isVerified: true }
        } else if (isVerifiedParam === 'false') {
            where.trainerProfile = { isVerified: false }
        }

        const [trainers, total] = await Promise.all([
            db.user.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    trainerProfile: {
                        select: {
                            id: true,
                            isVerified: true,
                            specializations: true,
                            certifications: true,
                            yearsExperience: true,
                            hourlyRate: true,
                            bio: true,
                            isAcceptingClients: true,
                        }
                    },
                    _count: {
                        select: {
                            assignedClients: true,
                            createdWorkouts: true,
                        }
                    }
                }
            }),
            db.user.count({ where }),
        ])

        return NextResponse.json({ items: trainers, total, page, pageSize })
    } catch (error) {
        console.error('Error fetching trainers:', error)
        return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 })
    }
}
