'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ClientCard } from '@/components/trainer/ClientCard'
import { ClientListSkeleton } from '@/components/trainer/ClientSkeletons'
import { BulkActionToolbar } from '@/components/trainer/BulkActionToolbar'
import { UserPlus, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { ClientStatus } from '@prisma/client'

interface Client {
    id: string
    name: string | null
    email: string
    status: ClientStatus
    startDate: Date
    lastActivity?: Date
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'ALL'>('ALL')
    const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'lastActivity'>('startDate')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('/api/trainer/clients')
                if (response.ok) {
                    const data = await response.json()
                    setClients(data)
                }
            } catch (error) {
                console.error('Error fetching clients:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchClients()
    }, [])

    // Filter and sort clients
    const filteredAndSortedClients = clients
        .filter((client) => {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                client.name?.toLowerCase().includes(query) ||
                client.email.toLowerCase().includes(query)
            const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter
            return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
            let comparison = 0
            if (sortBy === 'name') {
                comparison = (a.name || '').localeCompare(b.name || '')
            } else if (sortBy === 'startDate') {
                comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            } else if (sortBy === 'lastActivity' && a.lastActivity && b.lastActivity) {
                comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
            }
            return sortOrder === 'asc' ? comparison : -comparison
        })

    // Bulk selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredAndSortedClients.map(c => c.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectClient = (clientId: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, clientId])
        } else {
            setSelectedIds(prev => prev.filter(id => id !== clientId))
        }
    }

    const handleBulkComplete = async () => {
        setSelectedIds([])
        // Refetch clients
        try {
            const response = await fetch('/api/trainer/clients')
            if (response.ok) {
                const data = await response.json()
                setClients(data)
            }
        } catch (error) {
            console.error('Error refetching clients:', error)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Khách Hàng Của Tôi</h1>
                        <p className="text-muted-foreground mt-2">
                            Quản lý và theo dõi khách hàng
                        </p>
                    </div>
                </div>
                <ClientListSkeleton />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Clients</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and track your client relationships
                    </p>
                </div>
                <Button asChild>
                    <Link href="/trainer/clients/invite">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Client
                    </Link>
                </Button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tìm Kiếm & Lọc</CardTitle>
                            <CardDescription>Tìm và lọc khách hàng theo tiêu chí</CardDescription>
                        </div>
                        {filteredAndSortedClients.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedIds.length === filteredAndSortedClients.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span className="text-sm text-muted-foreground">
                                    Select All ({filteredAndSortedClients.length})
                                </span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Search */}
                        <div className="relative md:col-span-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm theo tên hoặc email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="INVITED">Đã mời</SelectItem>
                                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                                    <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort */}
                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Tên</SelectItem>
                                    <SelectItem value="startDate">Ngày bắt đầu</SelectItem>
                                    <SelectItem value="lastActivity">Hoạt động gần nhất</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Grid */}
            {filteredAndSortedClients.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Không tìm thấy khách hàng</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Thử điều chỉnh bộ lọc của bạn'
                                    : 'Bắt đầu bằng cách mời khách hàng đầu tiên'}
                            </p>
                            {!searchQuery && statusFilter === 'ALL' && (
                                <Button asChild>
                                    <Link href="/trainer/clients/invite">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Mời Khách Hàng
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAndSortedClients.map((client) => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                isSelected={selectedIds.includes(client.id)}
                                onSelectChange={(checked) => handleSelectClient(client.id, checked)}
                            />
                        ))}
                    </div>

                    {selectedIds.length > 0 && (
                        <BulkActionToolbar
                            selectedCount={selectedIds.length}
                            selectedIds={selectedIds}
                            onClearSelection={() => setSelectedIds([])}
                            onBulkComplete={handleBulkComplete}
                        />
                    )}
                </>
            )}
        </div>
    )
}
