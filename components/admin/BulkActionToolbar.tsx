'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Trash2, UserCog, CheckCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface BulkActionToolbarProps {
    selectedUserIds: string[]
    onSuccess: () => void
    onClearSelection: () => void
}

export function BulkActionToolbar({ selectedUserIds, onSuccess, onClearSelection }: BulkActionToolbarProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [selectedAction, setSelectedAction] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<string>('')

    const handleBulkAction = async () => {
        if (!selectedAction) {
            toast({
                title: 'Error',
                description: 'Please select an action',
                variant: 'destructive',
            })
            return
        }

        if (selectedAction === 'changeRole' && !selectedRole) {
            toast({
                title: 'Error',
                description: 'Please select a role',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/users/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: selectedAction,
                    userIds: selectedUserIds,
                    role: selectedRole || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Bulk action failed')
            }

            toast({
                title: 'Success',
                description: data.message,
            })

            onSuccess()
            onClearSelection()
            setSelectedAction('')
            setSelectedRole('')
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

    if (selectedUserIds.length === 0) return null

    return (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium">
                {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected
            </span>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="delete">
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Users
                        </div>
                    </SelectItem>
                    <SelectItem value="changeRole">
                        <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            Change Role
                        </div>
                    </SelectItem>
                    <SelectItem value="verifyEmail">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Verify Email
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            {selectedAction === 'changeRole' && (
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="TRAINER">Trainer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            )}

            <Button
                onClick={handleBulkAction}
                disabled={loading || !selectedAction}
                variant={selectedAction === 'delete' ? 'destructive' : 'default'}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply
            </Button>

            <Button
                variant="outline"
                onClick={onClearSelection}
                disabled={loading}
            >
                Clear
            </Button>
        </div>
    )
}
