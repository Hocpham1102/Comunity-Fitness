import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import { createNotification } from '@/lib/server/services/notification.service'

export async function GET(req: NextRequest) {
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

        // Get trainer's clients
        const clients = await db.trainerClient.findMany({
            where: {
                trainerId: session.user.id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        workoutLogs: {
                            orderBy: { startedAt: 'desc' },
                            take: 1,
                            select: { startedAt: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Transform data
        const transformedClients = clients.map((tc) => ({
            id: tc.client.id,
            name: tc.client.name,
            email: tc.client.email,
            image: tc.client.image,
            status: tc.status,
            startDate: tc.startDate,
            endDate: tc.endDate,
            notes: tc.notes,
            lastActivity: tc.client.workoutLogs[0]?.startedAt || null,
            relationshipId: tc.id,
        }))

        return NextResponse.json(transformedClients)
    } catch (error) {
        console.error('Error fetching clients:', error)
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
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

        const body = await req.json()
        const { email, notes } = body

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Find the client by email
        const client = await db.user.findUnique({
            where: { email },
        })

        if (!client) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if relationship already exists
        const existing = await db.trainerClient.findUnique({
            where: {
                trainerId_clientId: {
                    trainerId: session.user.id,
                    clientId: client.id,
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Client already added' },
                { status: 400 }
            )
        }

        // Create trainer-client relationship
        const trainerClient = await db.trainerClient.create({
            data: {
                trainerId: session.user.id,
                clientId: client.id,
                status: 'INVITED',
                notes: notes || null,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                trainer: {
                    select: { name: true },
                },
            },
        })

        // Notify the client about the invitation
        await createNotification({
            userId: client.id,
            type: 'SYSTEM',
            title: 'Trainer Invitation',
            message: `${trainerClient.trainer.name ?? 'A trainer'} has invited you to become their client.`,
            link: `/invitations`,
        })

        return NextResponse.json(trainerClient, { status: 201 })
    } catch (error) {
        console.error('Error inviting client:', error)
        return NextResponse.json(
            { error: 'Failed to invite client' },
            { status: 500 }
        )
    }
}
