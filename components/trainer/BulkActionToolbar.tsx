'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ClientStatus } from '@prisma/client'
import {
    MoreHorizontal,
    UserCheck,
    UserX,
    Trash2,
    Download,
    X
} from 'lucide-react'
import { toast } from 'sonner'

interface BulkActionToolbarProps {
    selectedCount: number
    selectedIds: string[]
    onClearSelection: () => void
    onBulkComplete: () => void
}

export function BulkActionToolbar({
    selectedCount,
    selectedIds,
    onClearSelection,
    onBulkComplete,
}: BulkActionToolbarProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleBulkStatusChange = async (status: ClientStatus) => {
        setIsProcessing(true)
        try {
            const response = await fetch('/api/trainer/clients/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientIds: selectedIds, status }),
            })

            if (!response.ok) throw new Error('Failed to update status')

            toast.success(`Updated ${selectedCount} client(s) to ${status}`)
            onBulkComplete()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update client status')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBulkDelete = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch('/api/trainer/clients/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientIds: selectedIds }),
            })

            if (!response.ok) throw new Error('Failed to delete clients')

            toast.success(`Deleted ${selectedCount} client(s)`)
            setShowDeleteDialog(false)
            onBulkComplete()
        } catch (error) {
            console.error('Error deleting clients:', error)
            toast.error('Failed to delete clients')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBulkExport = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch('/api/trainer/clients/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientIds: selectedIds }),
            })

            if (!response.ok) throw new Error('Failed to export clients')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Exported client data successfully')
        } catch (error) {
            console.error('Error exporting clients:', error)
            toast.error('Failed to export client data')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
                <div className="bg-primary text-primary-foreground rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedCount} selected</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-primary-foreground/20" />

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={isProcessing}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Change Status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('ACTIVE')}>
                                    Set as Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('INACTIVE')}>
                                    Set as Inactive
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('CANCELLED')}>
                                    Set as Cancelled
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleBulkExport}
                            disabled={isProcessing}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isProcessing}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedCount} client(s) and all their associated data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isProcessing ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
