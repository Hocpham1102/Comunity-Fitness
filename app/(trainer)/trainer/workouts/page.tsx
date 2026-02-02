'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import TrainerWorkoutCard from '@/components/features/workouts/TrainerWorkoutCard'
import AssignWorkoutDialog from '@/components/features/workouts/AssignWorkoutDialog'

interface Workout {
    id: string
    name: string
    description?: string | null
    difficulty?: string | null
    estimatedTime?: number | null
    exercises?: any[]
}

export default function TrainerWorkoutsPage() {
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedWorkout, setSelectedWorkout] = useState<{ id: string; name: string } | null>(null)

    useEffect(() => {
        fetchWorkouts()
    }, [])

    const fetchWorkouts = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/trainer/workouts')
            if (!response.ok) {
                throw new Error('Failed to fetch workouts')
            }
            const data = await response.json()
            setWorkouts(data.data || [])
        } catch (error) {
            console.error('Error fetching workouts:', error)
            toast.error('Failed to load workout templates')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workout template?')) {
            return
        }

        try {
            const response = await fetch(`/api/trainer/workouts/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete workout')
            }

            toast.success('Workout template deleted')
            fetchWorkouts()
        } catch (error) {
            console.error('Error deleting workout:', error)
            toast.error('Failed to delete workout template')
        }
    }

    const handleAssign = (id: string) => {
        const workout = workouts.find((w) => w.id === id)
        if (workout) {
            setSelectedWorkout({ id: workout.id, name: workout.name })
            setAssignDialogOpen(true)
        }
    }

    const handleAssignSuccess = () => {
        toast.success('Workout assigned successfully')
        // Optionally refresh workouts list
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Workout Templates</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage your workout templates
                    </p>
                </div>
                <Button asChild>
                    <Link href="/trainer/workouts/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Link>
                </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading templates...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && workouts.length === 0 && (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No workout templates yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first workout template to assign to clients
                            </p>
                            <Button asChild>
                                <Link href="/trainer/workouts/create">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Template
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Workout Templates Grid */}
            {!isLoading && workouts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workouts.map((workout) => (
                        <TrainerWorkoutCard
                            key={workout.id}
                            id={workout.id}
                            name={workout.name}
                            description={workout.description}
                            difficulty={workout.difficulty}
                            estimatedTime={workout.estimatedTime}
                            exercisesCount={workout.exercises?.length ?? 0}
                            onDelete={handleDelete}
                            onAssign={handleAssign}
                        />
                    ))}
                </div>
            )}

            {/* Assign Workout Dialog */}
            {selectedWorkout && (
                <AssignWorkoutDialog
                    workoutId={selectedWorkout.id}
                    workoutName={selectedWorkout.name}
                    open={assignDialogOpen}
                    onOpenChange={setAssignDialogOpen}
                    onSuccess={handleAssignSuccess}
                />
            )}
        </div>
    )
}

