import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ clientId: string }> }
) {
    try {
        const { clientId } = await context.params;
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is a trainer or admin
        if (session.user.role !== 'TRAINER' && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { notes } = await req.json()

        // Verify trainer-client relationship exists
        const relationship = await db.trainerClient.findFirst({
            where: {
                trainerId: session.user.id,
                clientId,
            },
        })

        if (!relationship) {
            return NextResponse.json(
                { error: 'Client not found or not assigned to you' },
                { status: 404 }
            )
        }

        // Update notes
        const updated = await db.trainerClient.updateMany({
            where: {
                trainerId: session.user.id,
                clientId,
            },
            data: {
                notes: notes || null,
            },
        })

        return NextResponse.json({ success: true, updated: updated.count })
    } catch (error) {
        console.error('Error updating notes:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
