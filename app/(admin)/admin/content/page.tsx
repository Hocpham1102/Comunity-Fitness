'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Search, CheckCircle, XCircle, Clock, Dumbbell,
    Loader2, X, ArrowLeft, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

interface ContentItem {
    id: string
    name: string
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
    rejectionReason: string | null
    createdAt: string
    contentType: 'exercise' | 'workout'
    difficulty?: string
    muscleGroups?: string[]
    createdBy: { id: string; name: string | null; email: string }
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'APPROVED') return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />Approved
        </Badge>
    )
    if (status === 'REJECTED') return (
        <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />Rejected
        </Badge>
    )
    return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            <Clock className="w-3 h-3 mr-1" />Pending
        </Badge>
    )
}

export default function AdminContentPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [type, setType] = useState('all')
    const [status, setStatus] = useState('PENDING')
    const [page, setPage] = useState(1)
    const pageSize = 20

    const debouncedSearch = useDebounce(search, 400)

    const fetchContent = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                status,
                type,
            })
            if (debouncedSearch) params.set('q', debouncedSearch)

            const res = await fetch(`/api/admin/content?${params}`)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setItems(data.items)
            setTotal(data.total)
        } catch {
            toast.error('Failed to load content')
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch, type, status])

    useEffect(() => { fetchContent() }, [fetchContent])
    useEffect(() => { setPage(1) }, [debouncedSearch, type, status])

    const handleAction = async (item: ContentItem, approvalStatus: 'APPROVED' | 'REJECTED') => {
        let rejectionReason = ''
        if (approvalStatus === 'REJECTED') {
            const reason = prompt('Reason for rejection (optional):')
            if (reason === null) return // cancelled
            rejectionReason = reason
        }
        try {
            const res = await fetch('/api/admin/content', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id, contentType: item.contentType, approvalStatus, rejectionReason }),
            })
            if (!res.ok) throw new Error()
            toast.success(`${item.name} ${approvalStatus.toLowerCase()}`)
            fetchContent()
        } catch {
            toast.error('Failed to update content')
        }
    }

    const clearFilters = () => { setSearch(''); setType('all'); setStatus('PENDING') }
    const hasFilters = search || type !== 'all' || status !== 'PENDING'
    const totalPages = Math.ceil(total / pageSize)

    // Summary counts from current page (approximate)
    const pendingCount = items.filter(i => i.approvalStatus === 'PENDING').length

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/trainers"><ArrowLeft className="w-4 h-4 mr-1" />Trainers</Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Review</h1>
                    <p className="text-muted-foreground">Moderate exercises and workouts submitted by trainers</p>
                </div>
            </div>

            {/* Pending indicator */}
            {status === 'PENDING' && total > 0 && (
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/50">
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                            {total} item{total !== 1 ? 's' : ''} waiting for review
                        </span>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Content Queue</CardTitle>
                            <CardDescription>Total: {total} items</CardDescription>
                        </div>
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                <X className="w-4 h-4 mr-1" />Reset filters
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input placeholder="Search by name..." className="pl-10"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="all">All Status</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="exercise">Exercise</SelectItem>
                                <SelectItem value="workout">Workout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left text-sm font-medium">Content</th>
                                    <th className="p-3 text-left text-sm font-medium">Trainer</th>
                                    <th className="p-3 text-left text-sm font-medium">Submitted</th>
                                    <th className="p-3 text-left text-sm font-medium">Status</th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </td></tr>
                                ) : items.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">
                                        <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-green-500" />
                                        <p className="font-medium">All clear!</p>
                                        <p className="text-sm">No content pending review</p>
                                    </td></tr>
                                ) : items.map(item => (
                                    <tr key={`${item.contentType}-${item.id}`} className="border-b hover:bg-muted/50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Dumbbell className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{item.name}</p>
                                                    <Badge variant="outline" className="text-xs mt-0.5 capitalize">
                                                        {item.contentType}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div>
                                                <p className="text-sm font-medium">{item.createdBy.name || '—'}</p>
                                                <p className="text-xs text-muted-foreground">{item.createdBy.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-3">
                                            <div>
                                                <StatusBadge status={item.approvalStatus} />
                                                {item.approvalStatus === 'REJECTED' && item.rejectionReason && (
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={item.rejectionReason}>
                                                        {item.rejectionReason}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                {item.approvalStatus !== 'APPROVED' && (
                                                    <Button size="sm" onClick={() => handleAction(item, 'APPROVED')}>
                                                        <CheckCircle className="w-3 h-3 mr-1" />Approve
                                                    </Button>
                                                )}
                                                {item.approvalStatus !== 'REJECTED' && (
                                                    <Button size="sm" variant="destructive" onClick={() => handleAction(item, 'REJECTED')}>
                                                        <XCircle className="w-3 h-3 mr-1" />Reject
                                                    </Button>
                                                )}
                                                {item.approvalStatus === 'REJECTED' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleAction(item, 'APPROVED')}>
                                                        Re-approve
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                    <ChevronLeft className="h-4 w-4" />Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                                    Next<ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
