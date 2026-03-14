'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { approvePayoutRequest, rejectPayoutRequest } from '@/app/api/admin/payouts/actions'

interface PayoutsClientProps {
    payoutRequests: any[]
}

export default function PayoutsClient({ payoutRequests }: PayoutsClientProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isApproving, setIsApproving] = useState<string | null>(null)
    const [isRejecting, setIsRejecting] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const filteredRequests = payoutRequests.filter(p =>
        p.trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.accountName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleApprove = async (id: string, amount: number) => {
        if (!confirm(`Are you sure you want to approve this payout of ${new Intl.NumberFormat('vi-VN').format(amount)} VND? You should have already transferred the money to their bank account.`)) {
            return
        }

        try {
            setIsApproving(id)
            await approvePayoutRequest(id)
            toast.success('Payout marked as approved.')
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve payout.')
        } finally {
            setIsApproving(null)
        }
    }

    const handleReject = async (id: string) => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection.')
            return
        }

        try {
            setIsRejecting(id)
            await rejectPayoutRequest(id, rejectReason)
            toast.success('Payout rejected. Funds have been returned to the trainer.')
            setRejectReason('')
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject payout.')
        } finally {
            setIsRejecting(null)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <Input
                    placeholder="Search by trainer name, email or account name..."
                    className="max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Trainer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Bank Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No payout requests found.
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="whitespace-nowrap">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{p.trainer.name || 'Unnamed Trainer'}</div>
                                    <div className="text-xs text-muted-foreground">{p.trainer.email}</div>
                                </TableCell>
                                <TableCell className="font-bold text-primary">
                                    {new Intl.NumberFormat('vi-VN').format(p.amount)} đ
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="font-medium">{p.bankName}</div>
                                    <div>{p.accountNumber} ({p.accountName})</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={p.status === 'APPROVED' ? 'default' : p.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                        {p.status}
                                    </Badge>
                                    {p.adminNote && (
                                        <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={p.adminNote}>
                                            Note: {p.adminNote}
                                        </div>
                                    )}
                                    {p.reviewedBy && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            By: {p.reviewedBy.name}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {p.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        Reject
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Reject Payout</DialogTitle>
                                                        <DialogDescription>
                                                            Please provide a reason for rejecting this payout. The funds will be returned to the trainer's wallet.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-4">
                                                        <Textarea
                                                            placeholder="e.g. Invalid bank account number..."
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button disabled={isRejecting === p.id} variant="destructive" onClick={() => handleReject(p.id)}>
                                                            Confirm Rejection
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={isApproving === p.id}
                                                onClick={() => handleApprove(p.id, p.amount)}
                                            >
                                                {isApproving === p.id ? 'Approving...' : 'Approve'}
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
