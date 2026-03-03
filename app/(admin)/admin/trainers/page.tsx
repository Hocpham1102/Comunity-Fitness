'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Search, ShieldCheck, ShieldOff, Users, Dumbbell,
    ChevronLeft, ChevronRight, Loader2, X, Eye,
    Clock, CheckCircle2, XCircle, ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

interface Trainer {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
    trainerProfile: {
        id: string
        isVerified: boolean
        specializations: string[]
        certifications: string[]
        yearsExperience: number | null
        hourlyRate: number | null
        bio: string | null
        isAcceptingClients: boolean
    } | null
    _count: {
        assignedClients: number
        createdWorkouts: number
    }
}

interface VerificationRequest {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    fullName: string
    phoneNumber: string
    yearsExperience: number
    specializations: string[]
    certifications: string[]
    bio: string
    certificateUrl: string | null
    adminNote: string | null
    submittedAt: string
    reviewedAt: string | null
    trainer: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

export default function AdminTrainersPage() {
    // --- Trainers tab state ---
    const [trainers, setTrainers] = useState<Trainer[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [verifiedFilter, setVerifiedFilter] = useState('all')
    const [page, setPage] = useState(1)
    const pageSize = 20
    const debouncedSearch = useDebounce(search, 400)

    // --- Verification Requests tab state ---
    const [requests, setRequests] = useState<VerificationRequest[]>([])
    const [requestsTotal, setRequestsTotal] = useState(0)
    const [requestsLoading, setRequestsLoading] = useState(false)
    const [requestsStatusFilter, setRequestsStatusFilter] = useState('PENDING')
    const [requestsPage, setRequestsPage] = useState(1)
    const requestsPageSize = 20

    // --- Review dialog ---
    const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: VerificationRequest | null }>({ open: false, request: null })
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
    const [adminNote, setAdminNote] = useState('')
    const [reviewing, setReviewing] = useState(false)

    // ── Trainers ──────────────────────────────────────────────────────────
    const fetchTrainers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() })
            if (debouncedSearch) params.set('q', debouncedSearch)
            if (verifiedFilter !== 'all') params.set('isVerified', verifiedFilter)
            const res = await fetch(`/api/admin/trainers?${params}`)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setTrainers(data.items)
            setTotal(data.total)
        } catch {
            toast.error('Failed to load trainers')
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch, verifiedFilter])

    useEffect(() => { fetchTrainers() }, [fetchTrainers])
    useEffect(() => { setPage(1) }, [debouncedSearch, verifiedFilter])

    const handleToggleVerify = async (trainer: Trainer) => {
        const newStatus = !trainer.trainerProfile?.isVerified
        try {
            const res = await fetch(`/api/admin/trainers/${trainer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: newStatus }),
            })
            if (!res.ok) throw new Error()
            toast.success(`${trainer.name} ${newStatus ? 'verified' : 'unverified'} successfully`)
            fetchTrainers()
        } catch {
            toast.error('Failed to update trainer')
        }
    }

    // ── Verification Requests ─────────────────────────────────────────────
    const fetchRequests = useCallback(async () => {
        setRequestsLoading(true)
        try {
            const params = new URLSearchParams({
                page: requestsPage.toString(),
                pageSize: requestsPageSize.toString(),
                status: requestsStatusFilter,
            })
            const res = await fetch(`/api/admin/verification-requests?${params}`)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setRequests(data.items)
            setRequestsTotal(data.total)
        } catch {
            toast.error('Failed to load verification requests')
        } finally {
            setRequestsLoading(false)
        }
    }, [requestsPage, requestsStatusFilter])

    useEffect(() => { fetchRequests() }, [fetchRequests])
    useEffect(() => { setRequestsPage(1) }, [requestsStatusFilter])

    const openReview = (req: VerificationRequest, action: 'approve' | 'reject') => {
        setReviewDialog({ open: true, request: req })
        setReviewAction(action)
        setAdminNote('')
    }

    const handleReview = async () => {
        if (!reviewDialog.request || !reviewAction) return
        setReviewing(true)
        try {
            const res = await fetch(`/api/admin/verification-requests/${reviewDialog.request.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: reviewAction, adminNote: adminNote || null }),
            })
            if (!res.ok) throw new Error()
            toast.success(`Request ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`)
            setReviewDialog({ open: false, request: null })
            fetchRequests()
            fetchTrainers()
        } catch {
            toast.error('Failed to process request')
        } finally {
            setReviewing(false)
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    const clearFilters = () => { setSearch(''); setVerifiedFilter('all') }
    const hasFilters = search || verifiedFilter !== 'all'
    const totalPages = Math.ceil(total / pageSize)
    const requestsTotalPages = Math.ceil(requestsTotal / requestsPageSize)
    const pendingCount = requestsTotal

    const statusBadge = (status: string) => {
        if (status === 'PENDING') return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
        if (status === 'APPROVED') return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>
        return <Badge variant="destructive" className="border-0"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
                    <p className="text-muted-foreground">Verify trainers and manage their profiles</p>
                </div>
                <Link href="/admin/content">
                    <Button variant="outline">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Content Review
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{trainers.filter(t => t.trainerProfile?.isVerified).length}</p>
                            <p className="text-sm text-muted-foreground">Verified Trainers</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <ShieldOff className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{trainers.filter(t => !t.trainerProfile?.isVerified).length}</p>
                            <p className="text-sm text-muted-foreground">Unverified</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{requestsTotal}</p>
                            <p className="text-sm text-muted-foreground">Pending Requests</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="trainers" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="trainers" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />All Trainers
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Verification Requests
                        {requestsStatusFilter === 'PENDING' && requestsTotal > 0 && (
                            <Badge className="ml-1 bg-yellow-500 text-white border-0 text-xs px-1.5 py-0">{requestsTotal}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab: All Trainers ─────────────────────────────── */}
                <TabsContent value="trainers">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle>All Trainers</CardTitle>
                                    <CardDescription>Total: {total} trainers</CardDescription>
                                </div>
                                {hasFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                        <X className="w-4 h-4 mr-1" />Clear filters
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input placeholder="Search by name or email..." className="pl-10"
                                        value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="Verification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Trainers</SelectItem>
                                        <SelectItem value="true">Verified</SelectItem>
                                        <SelectItem value="false">Unverified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-medium">Trainer</th>
                                            <th className="p-3 text-left text-sm font-medium">Specializations</th>
                                            <th className="p-3 text-left text-sm font-medium">Experience</th>
                                            <th className="p-3 text-left text-sm font-medium">Clients</th>
                                            <th className="p-3 text-left text-sm font-medium">Workouts</th>
                                            <th className="p-3 text-left text-sm font-medium">Status</th>
                                            <th className="p-3 text-left text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={7} className="p-10 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                            </td></tr>
                                        ) : trainers.length === 0 ? (
                                            <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">
                                                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                                <p>No trainers found</p>
                                            </td></tr>
                                        ) : trainers.map(trainer => (
                                            <tr key={trainer.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={trainer.image ?? ''} />
                                                            <AvatarFallback>{trainer.name?.[0] ?? 'T'}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{trainer.name || 'No name'}</p>
                                                            <p className="text-xs text-muted-foreground">{trainer.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {trainer.trainerProfile?.specializations.slice(0, 2).map(s => (
                                                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                                        ))}
                                                        {(trainer.trainerProfile?.specializations.length ?? 0) > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{trainer.trainerProfile!.specializations.length - 2}
                                                            </Badge>
                                                        )}
                                                        {!trainer.trainerProfile?.specializations.length && (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground">
                                                    {trainer.trainerProfile?.yearsExperience
                                                        ? `${trainer.trainerProfile.yearsExperience} yrs`
                                                        : '—'}
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {trainer._count.assignedClients}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Dumbbell className="w-3 h-3" />
                                                        {trainer._count.createdWorkouts}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {trainer.trainerProfile?.isVerified ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                            <ShieldCheck className="w-3 h-3 mr-1" />Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <ShieldOff className="w-3 h-3 mr-1" />Unverified
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/admin/trainers/${trainer.id}`}>
                                                                <Eye className="w-3 h-3 mr-1" />View
                                                            </Link>
                                                        </Button>
                                                        {trainer.trainerProfile && (
                                                            <Button
                                                                size="sm"
                                                                variant={trainer.trainerProfile.isVerified ? 'secondary' : 'default'}
                                                                onClick={() => handleToggleVerify(trainer)}
                                                            >
                                                                {trainer.trainerProfile.isVerified
                                                                    ? <><ShieldOff className="w-3 h-3 mr-1" />Unverify</>
                                                                    : <><ShieldCheck className="w-3 h-3 mr-1" />Verify</>}
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
                </TabsContent>

                {/* ── Tab: Verification Requests ────────────────────── */}
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Verification Requests</CardTitle>
                                    <CardDescription>Review trainer verification submissions</CardDescription>
                                </div>
                                <Select value={requestsStatusFilter} onValueChange={setRequestsStatusFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="all">All</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {requestsLoading ? (
                                <div className="p-10 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground">
                                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                    <p>No {requestsStatusFilter.toLowerCase()} verification requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="border rounded-lg p-4 space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={req.trainer.image ?? ''} />
                                                        <AvatarFallback>{req.trainer.name?.[0] ?? 'T'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{req.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">{req.trainer.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {statusBadge(req.status)}
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(req.submittedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="grid md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Phone: </span>{req.phoneNumber}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Experience: </span>{req.yearsExperience} years
                                                </div>
                                                {req.certificateUrl && (
                                                    <div>
                                                        <a href={req.certificateUrl} target="_blank" rel="noopener noreferrer"
                                                            className="text-primary hover:underline">
                                                            View Certificate →
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Bio: </span>
                                                <span className="line-clamp-2">{req.bio}</span>
                                            </div>

                                            {req.specializations.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {req.specializations.map(s => (
                                                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {req.certifications.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {req.certifications.map(c => (
                                                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {req.adminNote && (
                                                <div className="text-sm bg-muted/50 rounded p-2">
                                                    <span className="text-muted-foreground font-medium">Admin note: </span>{req.adminNote}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {req.status === 'PENDING' && (
                                                <div className="flex gap-2 pt-1">
                                                    <Button size="sm" onClick={() => openReview(req, 'approve')} className="bg-green-600 hover:bg-green-700">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />Approve
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => openReview(req, 'reject')}>
                                                        <XCircle className="w-3 h-3 mr-1" />Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {requestsTotalPages > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {(requestsPage - 1) * requestsPageSize + 1}–{Math.min(requestsPage * requestsPageSize, requestsTotal)} of {requestsTotal}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setRequestsPage(p => p - 1)} disabled={requestsPage === 1}>
                                                    <ChevronLeft className="h-4 w-4" />Previous
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setRequestsPage(p => p + 1)} disabled={requestsPage === requestsTotalPages}>
                                                    Next<ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Review Dialog */}
            <Dialog open={reviewDialog.open} onOpenChange={open => setReviewDialog({ open, request: open ? reviewDialog.request : null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === 'approve' ? '✅ Approve Verification' : '❌ Reject Verification'}
                        </DialogTitle>
                        <DialogDescription>
                            {reviewAction === 'approve'
                                ? `This will verify ${reviewDialog.request?.fullName} and grant them full trainer features.`
                                : `Provide a reason so the trainer knows what to fix before resubmitting.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label htmlFor="adminNote">
                            {reviewAction === 'approve' ? 'Note (optional)' : 'Rejection Reason *'}
                        </Label>
                        <Textarea
                            id="adminNote"
                            placeholder={reviewAction === 'approve'
                                ? 'Optional message to the trainer...'
                                : 'e.g. Certificate link is invalid, please provide a working URL.'}
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialog({ open: false, request: null })}>
                            Cancel
                        </Button>
                        <Button
                            disabled={reviewing || (reviewAction === 'reject' && !adminNote.trim())}
                            onClick={handleReview}
                            className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                            variant={reviewAction === 'reject' ? 'destructive' : 'default'}
                        >
                            {reviewing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> :
                                reviewAction === 'approve' ? 'Approve' : 'Reject'
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
