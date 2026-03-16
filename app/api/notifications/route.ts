import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
    getNotifications,
    markAllNotificationsRead,
} from '@/lib/server/services/notification.service'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const data = await getNotifications(session.user.id)
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

export async function PATCH() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await markAllNotificationsRead(session.user.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking notifications as read:', error)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
}
