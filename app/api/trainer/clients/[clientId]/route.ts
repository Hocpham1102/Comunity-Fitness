import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user is a trainer or admin
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!user || (user.role !== 'TRAINER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { clientId } = params

        // Verify trainer has access to this client
        const relationship = await db.trainerClient.findFirst({
            where: {
                trainerId: session.user.id,
                clientId: clientId,
            },
        })

        if (!relationship) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Get detailed client information
        const client = await db.user.findUnique({
            where: { id: clientId },
            include: {
                profile: {
                    include: {
                        measurements: {
                            orderBy: { measuredAt: 'desc' },
                            take: 10,
                        },
                    },
                },
                workoutLogs: {
                    orderBy: { startedAt: 'desc' },
                    take: 10,
                    include: {
                        workout: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                nutritionLogs: {
                    where: {
                        consumedAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                        },
                    },
                    orderBy: { consumedAt: 'desc' },
                },
            },
        })

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Calculate stats
        const completedWorkouts = await db.workoutLog.count({
            where: {
                userId: clientId,
                completedAt: { not: null },
            },
        })

        const totalWorkouts = await db.workoutLog.count({
            where: {
                userId: clientId,
            },
        })

        const workoutCompletionRate =
            totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0

        // Get weight history for progress chart
        const weightHistory = await db.bodyMeasurement.findMany({
            where: {
                profileId: client.profile?.id,
                weight: { not: null },
            },
            select: {
                weight: true,
                measuredAt: true,
            },
            orderBy: { measuredAt: 'asc' },
            take: 50, // Last 50 measurements
        })

        // Format weight data for chart
        const weightData = weightHistory.map((measurement) => ({
            date: measurement.measuredAt.toISOString(),
            weight: measurement.weight || 0,
        }))

        return NextResponse.json({
            client,
            relationship,
            stats: {
                completedWorkouts,
                totalWorkouts,
                workoutCompletionRate: Math.round(workoutCompletionRate),
            },
            weightData,
        })
    } catch (error) {
        console.error('Error fetching client details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch client details' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user is a trainer or admin
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!user || (user.role !== 'TRAINER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { clientId } = params
        const body = await req.json()
        const { status, notes, endDate } = body

        // Update trainer-client relationship
        const updated = await db.trainerClient.updateMany({
            where: {
                trainerId: session.user.id,
                clientId: clientId,
            },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            },
        })

        if (updated.count === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating client:', error)
        return NextResponse.json(
            { error: 'Failed to update client' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user is a trainer or admin
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!user || (user.role !== 'TRAINER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { clientId } = params

        // Delete trainer-client relationship
        const deleted = await db.trainerClient.deleteMany({
            where: {
                trainerId: session.user.id,
                clientId: clientId,
            },
        })

        if (deleted.count === 0) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error removing client:', error)
        return NextResponse.json(
            { error: 'Failed to remove client' },
            { status: 500 }
        )
    }
}
