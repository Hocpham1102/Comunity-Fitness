import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const skip = (page - 1) * limit

        // Build where clause
        const where = {
            role: 'TRAINER' as const,
            trainerProfile: {
                isVerified: true,
            },
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        }

        // Fetch trainers with their profiles
        const [trainers, total] = await Promise.all([
            db.user.findMany({
                where,
                include: {
                    trainerProfile: true,
                    _count: {
                        select: {
                            createdCourses: {
                                where: { isPublished: true },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.user.count({ where }),
        ])

        return NextResponse.json({
            trainers: trainers.map((trainer) => ({
                id: trainer.id,
                name: trainer.name,
                email: trainer.email,
                image: trainer.image,
                profile: trainer.trainerProfile,
                courseCount: trainer._count.createdCourses,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching trainers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch trainers' },
            { status: 500 }
        )
    }
}
