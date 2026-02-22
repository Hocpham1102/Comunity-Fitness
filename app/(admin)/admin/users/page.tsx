'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, UserPlus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from 'lucide-react'
import { UserFormDialog } from '@/components/admin/UserFormDialog'
import { UserDetailsDialog } from '@/components/admin/UserDetailsDialog'
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog'
import { BulkActionToolbar } from '@/components/admin/BulkActionToolbar'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

interface User {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
    emailVerified: string | null
    image: string | null
    _count: {
        workoutLogs: number
        nutritionLogs: number
        assignedClients: number
    }
}

export default function AdminUsersPage() {
    const { toast } = useToast()
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [loading, setLoading] = useState(true)

    // Filters
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [emailVerifiedFilter, setEmailVerifiedFilter] = useState('all')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Dialogs
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editUser, setEditUser] = useState<User | null>(null)
    const [detailsUserId, setDetailsUserId] = useState<string | null>(null)
    const [deleteUser, setDeleteUser] = useState<User | null>(null)

    // Bulk selection
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

    const debouncedSearch = useDebounce(search, 500)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                sortBy,
                sortOrder,
            })

            if (debouncedSearch) params.append('search', debouncedSearch)
            if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter)
            if (emailVerifiedFilter && emailVerifiedFilter !== 'all') params.append('emailVerified', emailVerifiedFilter)

            const res = await fetch(`/api/admin/users?${params}`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data.items || [])
                setTotal(data.total || 0)
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch users',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch users',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, debouncedSearch, roleFilter, emailVerifiedFilter, sortBy, sortOrder, toast])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleRefresh = () => {
        setSelectedUserIds([])
        fetchUsers()
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(users.map(u => u.id))
        } else {
            setSelectedUserIds([])
        }
    }

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUserIds(prev => [...prev, userId])
        } else {
            setSelectedUserIds(prev => prev.filter(id => id !== userId))
        }
    }

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'destructive'
            case 'TRAINER':
                return 'default'
            default:
                return 'secondary'
        }
    }

    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions
                    </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Total: {total} users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={(value) => {
                                setRoleFilter(value)
                                setPage(1)
                            }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="TRAINER">Trainer</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={emailVerifiedFilter} onValueChange={(value) => {
                                setEmailVerifiedFilter(value)
                                setPage(1)
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="true">Verified</SelectItem>
                                    <SelectItem value="false">Unverified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bulk Actions */}
                        <BulkActionToolbar
                            selectedUserIds={selectedUserIds}
                            onSuccess={handleRefresh}
                            onClearSelection={() => setSelectedUserIds([])}
                        />
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left w-12">
                                        <Checkbox
                                            checked={selectedUserIds.length === users.length && users.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="p-3 text-left text-sm font-medium">
                                        <button
                                            onClick={() => toggleSort('name')}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            Name
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-3 text-left text-sm font-medium">
                                        <button
                                            onClick={() => toggleSort('email')}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            Email
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-3 text-left text-sm font-medium">Role</th>
                                    <th className="p-3 text-left text-sm font-medium">Status</th>
                                    <th className="p-3 text-left text-sm font-medium">
                                        <button
                                            onClick={() => toggleSort('createdAt')}
                                            className="flex items-center gap-1 hover:text-foreground"
                                        >
                                            Joined
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <Checkbox
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectUser(user.id, checked as boolean)
                                                    }
                                                />
                                            </td>
                                            <td className="p-3 text-sm">{user.name || 'N/A'}</td>
                                            <td className="p-3 text-sm">{user.email}</td>
                                            <td className="p-3 text-sm">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm">
                                                {user.emailVerified ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Unverified
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDetailsUserId(user.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditUser(user)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {user.id !== session?.user?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteUser(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} users
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={page === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setPage(pageNum)}
                                                disabled={loading}
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || loading}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <UserFormDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={handleRefresh}
            />

            <UserFormDialog
                open={!!editUser}
                onOpenChange={(open) => !open && setEditUser(null)}
                user={editUser || undefined}
                onSuccess={handleRefresh}
            />

            <UserDetailsDialog
                open={!!detailsUserId}
                onOpenChange={(open) => !open && setDetailsUserId(null)}
                userId={detailsUserId}
            />

            <DeleteUserDialog
                open={!!deleteUser}
                onOpenChange={(open) => !open && setDeleteUser(null)}
                user={deleteUser}
                onSuccess={handleRefresh}
            />
        </div>
    )
}
