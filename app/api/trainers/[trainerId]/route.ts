import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ trainerId: string }> }
) {
    try {
        const { trainerId } = await params

        const trainer = await db.user.findFirst({
            where: {
                id: trainerId,
                role: 'TRAINER',
                trainerProfile: {
                    isVerified: true,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                trainerProfile: {
                    select: {
                        bio: true,
                        specializations: true,
                        certifications: true,
                        yearsExperience: true,
                        hourlyRate: true,
                        websiteUrl: true,
                        instagramUrl: true,
                        twitterUrl: true,
                        isAcceptingClients: true,
                    },
                },
            },
        })

        if (!trainer) {
            return NextResponse.json(
                { error: 'Trainer not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(trainer)
    } catch (error) {
        console.error('Error fetching trainer:', error)
        return NextResponse.json(
            { error: 'Failed to fetch trainer' },
            { status: 500 }
        )
    }
}
