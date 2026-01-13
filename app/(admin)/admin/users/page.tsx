import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { headers } from 'next/headers'

async function getBaseUrl() {
    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
}

async function fetchUsers() {
    const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
    const hdrs = await headers()

    const res = await fetch(`${base}/api/admin/users?pageSize=50`, {
        cache: 'no-store',
        headers: {
            cookie: hdrs.get('cookie') ?? '',
        },
    })

    if (!res.ok) return { items: [], total: 0 }
    return res.json()
}

export default async function AdminUsersPage() {
    const data = await fetchUsers()
    const users = Array.isArray(data?.items) ? data.items : []

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions
                    </p>
                </div>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Total: {data.total || 0} users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search users..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left text-sm font-medium">Name</th>
                                    <th className="p-3 text-left text-sm font-medium">Email</th>
                                    <th className="p-3 text-left text-sm font-medium">Role</th>
                                    <th className="p-3 text-left text-sm font-medium">Joined</th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user: any) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 text-sm">{user.name || 'N/A'}</td>
                                            <td className="p-3 text-sm">{user.email}</td>
                                            <td className="p-3 text-sm">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                    <Button variant="destructive" size="sm">
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
