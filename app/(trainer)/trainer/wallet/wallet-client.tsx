'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { updateBankInfo, requestPayout } from '@/app/api/trainer/wallet/actions'

interface WalletClientProps {
    profile: any
    transactions: any[]
    payoutRequests: any[]
}

export default function WalletClient({ profile, transactions, payoutRequests }: WalletClientProps) {
    const [bankName, setBankName] = useState(profile.bankName || '')
    const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '')
    const [accountName, setAccountName] = useState(profile.accountName || '')
    const [payoutAmount, setPayoutAmount] = useState('')
    const [isUpdatingBank, setIsUpdatingBank] = useState(false)
    const [isRequesting, setIsRequesting] = useState(false)
    const [isBankDialogOpen, setIsBankDialogOpen] = useState(false)
    const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false)

    async function handleUpdateBank() {
        try {
            setIsUpdatingBank(true)
            await updateBankInfo({ bankName, accountNumber, accountName })
            toast.success('Bank information updated successfully.')
            setIsBankDialogOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to update bank info.')
        } finally {
            setIsUpdatingBank(false)
        }
    }

    async function handleRequestPayout() {
        try {
            setIsRequesting(true)
            await requestPayout(parseFloat(payoutAmount))
            toast.success('Payout requested successfully. Admin will review shortly.')
            setPayoutAmount('')
            setIsPayoutDialogOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to request payout.')
        } finally {
            setIsRequesting(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 shadow-sm h-fit">
                <CardHeader className="bg-primary/5 pb-4 border-b">
                    <CardTitle className="text-xl">Available Balance</CardTitle>
                    <CardDescription>Your current earnings ready for withdrawal.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="text-4xl font-black text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profile.walletBalance || 0)}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full" size="lg" disabled={!profile.walletBalance || profile.walletBalance <= 0}>
                                Request Payout
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Request Payout</DialogTitle>
                                <DialogDescription>
                                    Enter the amount you wish to withdraw to your bank account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Amount (VND)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        max={profile.walletBalance}
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">Available: {new Intl.NumberFormat('vi-VN').format(profile.walletBalance)} VND</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={handleRequestPayout}
                                    disabled={isRequesting || !payoutAmount || isNaN(Number(payoutAmount)) || Number(payoutAmount) <= 0 || Number(payoutAmount) > profile.walletBalance}
                                >
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Update Bank Info
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bank Information</DialogTitle>
                                <DialogDescription>
                                    Update where you want to receive your payouts.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Vietcombank" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="e.g. 1903..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Name</Label>
                                    <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="e.g. NGUYEN VAN A" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBankDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateBank} disabled={isUpdatingBank || !bankName || !accountName || !accountNumber}>Save Details</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="mt-4 pt-4 border-t w-full text-sm">
                        <p className="font-semibold mb-1">Current Bank Info:</p>
                        {profile.bankName ? (
                            <div className="space-y-1 text-muted-foreground">
                                <p>{profile.bankName}</p>
                                <p>No: {profile.accountNumber}</p>
                                <p>Name: {profile.accountName}</p>
                            </div>
                        ) : (
                            <p className="text-red-500 text-xs font-semibold">Bank info missing. Please update to request payout.</p>
                        )}
                    </div>
                </CardFooter>
            </Card>

            <Card className="md:col-span-2 shadow-sm">
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="transactions">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
                        </TabsList>

                        <TabsContent value="transactions">
                            {transactions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell className="w-[120px]">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={t.description}>{t.description}</TableCell>
                                                <TableCell className={t.type === 'EARNING' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                                    {t.type === 'EARNING' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(t.amount)} đ
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={t.status === 'COMPLETED' ? 'default' : t.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                                        {t.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>

                        <TabsContent value="payouts">
                            {payoutRequests.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No payout requests yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Bank Info</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payoutRequests.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="w-[120px]">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    {new Intl.NumberFormat('vi-VN').format(p.amount)} đ
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div>{p.bankName}</div>
                                                    <div className="text-muted-foreground">{p.accountNumber} ({p.accountName})</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={p.status === 'APPROVED' ? 'default' : p.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                                        {p.status}
                                                    </Badge>
                                                    {p.adminNote && <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={p.adminNote}>Note: {p.adminNote}</div>}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
