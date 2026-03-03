import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        const trainer = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                trainerProfile: true,
                _count: {
                    select: {
                        assignedClients: true,
                        createdWorkouts: true,
                    }
                }
            }
        })

        if (!trainer || trainer.trainerProfile === null) {
            return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
        }

        // Get workouts with approval status
        const workouts = await db.workout.findMany({
            where: { createdById: id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                difficulty: true,
                isPublic: true,
                approvalStatus: true,
                rejectionReason: true,
                createdAt: true,
                _count: { select: { exercises: true } }
            }
        })

        return NextResponse.json({ trainer, workouts })
    } catch (error) {
        console.error('Error fetching trainer:', error)
        return NextResponse.json({ error: 'Failed to fetch trainer' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { isVerified } = body

        const profile = await db.trainerProfile.update({
            where: { userId: id },
            data: { isVerified },
        })

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error updating trainer:', error)
        return NextResponse.json({ error: 'Failed to update trainer' }, { status: 500 })
    }
}
