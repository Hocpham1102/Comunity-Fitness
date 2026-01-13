'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface TogglePublicButtonProps {
    workoutId: string
    workoutName: string
    isPublic: boolean
}

export default function TogglePublicButton({ workoutId, workoutName, isPublic }: TogglePublicButtonProps) {
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const handleToggle = async () => {
        setIsUpdating(true)
        try {
            const response = await fetch(`/api/workouts/${workoutId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isPublic: !isPublic,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update workout')
            }

            toast.success(`"${workoutName}" is now ${!isPublic ? 'public' : 'private'}`)
            router.refresh()
        } catch (error: any) {
            console.error('Toggle public error:', error)
            toast.error(error.message || 'Failed to update workout')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isUpdating}
            title={isPublic ? 'Make Private' : 'Make Public'}
        >
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </Button>
    )
}
