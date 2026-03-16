import { db } from '@/lib/server/db/prisma'
import { NotificationType } from '@prisma/client'

export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
}: {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
}) {
    return db.notification.create({
        data: { userId, type, title, message, link: link ?? null },
    })
}

export async function getNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
        db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        }),
        db.notification.count({
            where: { userId, isRead: false },
        }),
    ])
    return { notifications, unreadCount }
}

export async function markNotificationRead(id: string, userId: string) {
    return db.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
    })
}

export async function markAllNotificationsRead(userId: string) {
    return db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    })
}
