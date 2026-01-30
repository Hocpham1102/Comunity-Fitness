import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import { ClientStatus } from '@prisma/client'

// PATCH - Bulk update client status
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { clientIds, status } = await req.json()

        if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
            return NextResponse.json(
                { error: 'Client IDs are required' },
                { status: 400 }
            )
        }

        if (!status || !Object.values(ClientStatus).includes(status)) {
            return NextResponse.json(
                { error: 'Valid status is required' },
                { status: 400 }
            )
        }

        // Update all clients that belong to this trainer
        const result = await db.trainerClient.updateMany({
            where: {
                trainerId: session.user.id,
                clientId: {
                    in: clientIds
                }
            },
            data: {
                status
            }
        })

        return NextResponse.json({
            success: true,
            updated: result.count
        })
    } catch (error) {
        console.error('Error in bulk update:', error)
        return NextResponse.json(
            { error: 'Failed to update clients' },
            { status: 500 }
        )
    }
}

// DELETE - Bulk delete clients
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { clientIds } = await req.json()

        if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
            return NextResponse.json(
                { error: 'Client IDs are required' },
                { status: 400 }
            )
        }

        // Delete all trainer-client relationships that belong to this trainer
        const result = await db.trainerClient.deleteMany({
            where: {
                trainerId: session.user.id,
                clientId: {
                    in: clientIds
                }
            }
        })

        return NextResponse.json({
            success: true,
            deleted: result.count
        })
    } catch (error) {
        console.error('Error in bulk delete:', error)
        return NextResponse.json(
            { error: 'Failed to delete clients' },
            { status: 500 }
        )
    }
}
