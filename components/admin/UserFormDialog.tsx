'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface UserFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: {
        id: string
        name: string | null
        email: string
        role: string
        phoneNumber?: string | null
    }
    onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        phoneNumber: '',
    })

    // Sync form data whenever the dialog opens or the user prop changes
    useEffect(() => {
        if (open) {
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                password: '',
                role: user?.role || 'USER',
                phoneNumber: user?.phoneNumber || '',
            })
        }
    }, [open, user])

    const isEditMode = !!user

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = isEditMode
                ? `/api/admin/users/${user.id}`
                : '/api/admin/users'

            const method = isEditMode ? 'PATCH' : 'POST'

            const body = isEditMode
                ? {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    phoneNumber: formData.phoneNumber,
                }
                : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save user')
            }

            toast({
                title: 'Success',
                description: isEditMode
                    ? 'User updated successfully'
                    : 'User created successfully',
            })

            onSuccess()
            onOpenChange(false)

            // Reset form
            if (!isEditMode) {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'USER',
                    phoneNumber: '',
                })
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update user information and permissions'
                            : 'Create a new user account'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        {!isEditMode && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="TRAINER">Trainer</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, phoneNumber: e.target.value })
                                }
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
