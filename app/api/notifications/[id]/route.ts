import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { markNotificationRead } from '@/lib/server/services/notification.service'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params
        await markNotificationRead(id, session.user.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }
}
