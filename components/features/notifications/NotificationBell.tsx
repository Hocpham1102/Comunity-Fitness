'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, Dumbbell, MessageSquare, Star, Trophy, X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type NotificationType =
    | 'WORKOUT_ASSIGNED'
    | 'MEAL_PLAN_ASSIGNED'
    | 'SUBSCRIPTION_EXPIRING'
    | 'NEW_MESSAGE'
    | 'ACHIEVEMENT'
    | 'SYSTEM'

interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

interface NotificationData {
    notifications: Notification[]
    unreadCount: number
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
    WORKOUT_ASSIGNED: <Dumbbell className="w-4 h-4 text-blue-500" />,
    MEAL_PLAN_ASSIGNED: <Star className="w-4 h-4 text-green-500" />,
    SUBSCRIPTION_EXPIRING: <Bell className="w-4 h-4 text-yellow-500" />,
    NEW_MESSAGE: <MessageSquare className="w-4 h-4 text-purple-500" />,
    ACHIEVEMENT: <Trophy className="w-4 h-4 text-amber-500" />,
    SYSTEM: <Bell className="w-4 h-4 text-muted-foreground" />,
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} mins ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
}

// Special notification for trainer invitations
function InviteNotificationItem({
    notification,
    onAction,
}: {
    notification: Notification
    onAction: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState<'accept' | 'decline' | null>(null)

    const invitationId = notification.link?.split('/invitations/')?.[1]

    const handle = async (action: 'accept' | 'decline') => {
        if (!invitationId) return
        setLoading(true)
        try {
            await fetch(`/api/invitations/${invitationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })
            setDone(action)
            // Also mark notification as read
            await fetch(`/api/notifications/${notification.id}`, { method: 'PATCH' })
            onAction()
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="px-4 py-3 text-sm text-muted-foreground">
                {done === 'accept' ? '✅ Invitation accepted' : '❌ Invitation declined'}
            </div>
        )
    }

    return null
}

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<NotificationData>({ notifications: [], unreadCount: 0 })
    const [invitations, setInvitations] = useState<Array<{
        id: string
        notes: string | null
        createdAt: string
        trainer: { id: string; name: string | null; image: string | null }
    }>>([])
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch {
            // silently fail
        }
    }, [])

    const fetchInvitations = useCallback(async () => {
        try {
            const res = await fetch('/api/invitations')
            if (res.ok) {
                const json = await res.json()
                setInvitations(json)
            }
        } catch {
            // silently fail
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
        fetchInvitations()
        intervalRef.current = setInterval(() => {
            fetchNotifications()
            fetchInvitations()
        }, 30000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [fetchNotifications, fetchInvitations])

    const markAllRead = async () => {
        await fetch('/api/notifications', { method: 'PATCH' })
        setData((prev) => ({
            ...prev,
            unreadCount: 0,
            notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
        }))
    }

    const markOneRead = async (id: string, link: string | null) => {
        await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
        setData((prev) => ({
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - 1),
            notifications: prev.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        }))
        if (link) {
            setOpen(false)
            router.push(link)
        }
    }

    const handleInvite = async (invId: string, action: 'accept' | 'decline') => {
        await fetch(`/api/invitations/${invId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        })
        setInvitations((prev) => prev.filter((i) => i.id !== invId))
        fetchNotifications()
    }

    const totalBadge = data.unreadCount + invitations.length

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {totalBadge > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
                            {totalBadge > 9 ? '9+' : totalBadge}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {data.unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={markAllRead}
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="max-h-[420px]">
                    {/* Pending invitations section */}
                    {invitations.length > 0 && (
                        <div>
                            <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Trainer Invitations
                            </p>
                            {invitations.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="px-4 py-3 border-b bg-blue-50/50 dark:bg-blue-950/20"
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 p-1.5">
                                            <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-tight">
                                                {inv.trainer.name ?? 'Trainer'} invited you
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {timeAgo(inv.createdAt)}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs px-3"
                                                    onClick={() => handleInvite(inv.id, 'accept')}
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs px-3"
                                                    onClick={() => handleInvite(inv.id, 'decline')}
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Regular notifications */}
                    {data.notifications.length > 0 && (
                        <div>
                            {invitations.length > 0 && (
                                <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Notifications
                                </p>
                            )}
                            {data.notifications.map((n) => (
                                <button
                                    key={n.id}
                                    className={cn(
                                        'w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors',
                                        !n.isRead && 'bg-muted/30'
                                    )}
                                    onClick={() => markOneRead(n.id, n.link)}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-0.5 rounded-full bg-muted p-1.5">
                                            {TYPE_ICON[n.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <p className={cn('text-sm leading-tight', !n.isRead && 'font-semibold')}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && (
                                                    <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/70 mt-1">
                                                {timeAgo(n.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {data.notifications.length === 0 && invitations.length === 0 && (
                        <div className="py-10 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
