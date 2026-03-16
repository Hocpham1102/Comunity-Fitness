import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import { createNotification } from '@/lib/server/services/notification.service'

/**
 * PATCH /api/invitations/[invitationId]
 * body: { action: 'accept' | 'decline' }
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ invitationId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { invitationId } = await params
        const body = await req.json()
        const { action } = body

        if (!['accept', 'decline'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Find the invitation and verify it belongs to the current user
        const invitation = await db.trainerClient.findFirst({
            where: {
                id: invitationId,
                clientId: session.user.id,
                status: 'INVITED',
            },
            include: {
                trainer: { select: { id: true, name: true } },
                client: { select: { id: true, name: true } },
            },
        })

        if (!invitation) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
        }

        const newStatus = action === 'accept' ? 'ACTIVE' : 'CANCELLED'

        await db.trainerClient.update({
            where: { id: invitationId },
            data: { status: newStatus },
        })

        // Notify trainer of the response
        if (action === 'accept') {
            await createNotification({
                userId: invitation.trainer.id,
                type: 'SYSTEM',
                title: 'Invitation Accepted',
                message: `${invitation.client.name ?? 'A client'} has accepted your invitation.`,
                link: `/trainer/clients`,
            })
        } else {
            await createNotification({
                userId: invitation.trainer.id,
                type: 'SYSTEM',
                title: 'Invitation Declined',
                message: `${invitation.client.name ?? 'A client'} has declined your invitation.`,
                link: `/trainer/clients`,
            })
        }

        return NextResponse.json({ success: true, status: newStatus })
    } catch (error) {
        console.error('Error responding to invitation:', error)
        return NextResponse.json({ error: 'Failed to respond to invitation' }, { status: 500 })
    }
}
