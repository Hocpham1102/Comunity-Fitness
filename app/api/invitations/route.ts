import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import { createNotification } from '@/lib/server/services/notification.service'

/**
 * GET /api/invitations
 * Lấy danh sách lời mời trainer dành cho user hiện tại (status = INVITED)
 */
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invitations = await db.trainerClient.findMany({
            where: {
                clientId: session.user.id,
                status: 'INVITED',
            },
            include: {
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        trainerProfile: {
                            select: {
                                specializations: true,
                                isVerified: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(invitations)
    } catch (error) {
        console.error('Error fetching invitations:', error)
        return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }
}

/**
 * PATCH /api/invitations/[invitationId]
 * Xác nhận (ACTIVE) hoặc từ chối (CANCELLED) lời mời
 */
