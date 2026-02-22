'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: {
        id: string
        name: string | null
        email: string
    } | null
    onSuccess: () => void
}

export function DeleteUserDialog({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!user) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete user')
            }

            toast({
                title: 'Success',
                description: 'User deleted successfully',
            })

            onSuccess()
            onOpenChange(false)
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
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete User
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the user account
                        and all associated data.
                    </DialogDescription>
                </DialogHeader>
                {user && (
                    <div className="py-4">
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                            <p className="text-sm font-medium">User to be deleted:</p>
                            <p className="text-sm mt-1">
                                <span className="font-semibold">{user.name || 'N/A'}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
