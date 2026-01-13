'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface DeleteWorkoutButtonProps {
    workoutId: string
    workoutName: string
    redirectUrl?: string // Optional redirect URL after deletion
    size?: 'default' | 'sm' | 'lg' | 'icon' // Button size
}

export default function DeleteWorkoutButton({ workoutId, workoutName, redirectUrl, size = 'icon' }: DeleteWorkoutButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/workouts/${workoutId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to delete workout')
            }

            toast.success('Workout deleted successfully')
            setOpen(false)

            // Redirect to custom URL or refresh the current page
            if (redirectUrl) {
                router.push(redirectUrl)
            } else {
                router.refresh()
            }
        } catch (error: any) {
            console.error('Delete workout error:', error)
            toast.error(error.message || 'Failed to delete workout')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size={size} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className={size === 'icon' ? 'w-4 h-4' : 'w-5 h-5 mr-2'} />
                    {size !== 'icon' && 'Delete'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the workout "{workoutName}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
