'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Check, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useNotify } from '@/providers/notifications-provider'

interface Invitation {
    id: string
    notes: string | null
    createdAt: string
    trainer: {
        id: string
        name: string | null
        email: string | null
        image: string | null
        trainerProfile: {
            specializations: string[]
            isVerified: boolean
        } | null
    }
}

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const notify = useNotify()

    const fetchInvitations = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/invitations')
            if (res.ok) {
                const data = await res.json()
                setInvitations(data)
            }
        } catch {
            notify.error({ title: 'Error', description: 'Failed to load invitations' })
        } finally {
            setLoading(false)
        }
    }, [notify])

    useEffect(() => {
        fetchInvitations()
    }, [fetchInvitations])

    const handleAction = async (invId: string, action: 'accept' | 'decline') => {
        setActionLoading(invId + action)
        try {
            const res = await fetch(`/api/invitations/${invId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })
            if (res.ok) {
                setInvitations((prev) => prev.filter((i) => i.id !== invId))
                notify.success({
                    title: action === 'accept' ? 'Accepted' : 'Declined',
                    description: action === 'accept'
                        ? 'You are now a client of this trainer.'
                        : 'Declined the invitation.',
                })
            } else {
                notify.error({ title: 'Error', description: 'Failed to perform this action' })
            }
        } catch {
            notify.error({ title: 'Error', description: 'An error occurred' })
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="w-6 h-6" />
                        Trainer Invitations
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        View and respond to trainer invitations
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchInvitations} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 animate-pulse">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-1/3" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : invitations.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                    <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No invitations</p>
                    <p className="text-sm mt-1">When a trainer invites you, they will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invitations.map((inv) => {
                        const initials = inv.trainer.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) ?? 'TR'

                        return (
                            <div
                                key={inv.id}
                                className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-4 items-start">
                                    <Avatar className="h-12 w-12 shrink-0">
                                        <AvatarImage src={inv.trainer.image ?? undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold">
                                                {inv.trainer.name ?? 'Trainer'}
                                            </span>
                                            {inv.trainer.trainerProfile?.isVerified && (
                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs">
                                                    ✓ Verified
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{inv.trainer.email}</p>
                                        {inv.trainer.trainerProfile?.specializations?.length ? (
                                            <div className="flex gap-1 flex-wrap mt-1.5">
                                                {inv.trainer.trainerProfile.specializations.slice(0, 3).map((s) => (
                                                    <Badge key={s} variant="secondary" className="text-xs">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : null}
                                        {inv.notes && (
                                            <p className="text-sm text-muted-foreground mt-2 italic">
                                                "{inv.notes}"
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => handleAction(inv.id, 'accept')}
                                                disabled={actionLoading === inv.id + 'accept'}
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1"
                                                onClick={() => handleAction(inv.id, 'decline')}
                                                disabled={actionLoading === inv.id + 'decline'}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
