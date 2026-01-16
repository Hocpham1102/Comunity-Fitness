'use client'

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

interface ResumeWorkoutDialogProps {
    open: boolean
    onContinue: () => void
    onStartFresh: () => void
    workoutTitle: string
    lastUpdated: string
}

export default function ResumeWorkoutDialog({
    open,
    onContinue,
    onStartFresh,
    workoutTitle,
    lastUpdated,
}: ResumeWorkoutDialogProps) {
    const formatLastUpdated = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const hoursDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (hoursDiff < 1) return 'less than an hour ago'
        if (hoursDiff < 24) return `${hoursDiff} hours ago`
        const daysDiff = Math.floor(hoursDiff / 24)
        return `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Resume Workout?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            You have an in-progress session for <strong>{workoutTitle}</strong>.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {formatLastUpdated(lastUpdated)}
                        </p>
                        <p>
                            Would you like to continue where you left off or start fresh?
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onStartFresh}>
                        Start Fresh
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onContinue}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
