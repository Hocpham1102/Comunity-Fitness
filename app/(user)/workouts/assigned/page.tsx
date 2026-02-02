'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dumbbell, Clock, User, Calendar, Loader2, Play, Info } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface AssignedWorkout {
    id: string
    name: string
    description?: string | null
    difficulty: string
    estimatedTime?: number | null
    exercisesCount: number
    trainerName: string | null
    trainerEmail: string
    trainerImage: string | null
    assignedAt: Date
    assignmentNotes?: string | null
}

export default function AssignedWorkoutsPage() {
    const [workouts, setWorkouts] = useState<AssignedWorkout[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAssignedWorkouts()
    }, [])

    const fetchAssignedWorkouts = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/workouts/assigned')
            if (!response.ok) {
                throw new Error('Failed to fetch assigned workouts')
            }
            const data = await response.json()
            setWorkouts(data.workouts || [])
        } catch (error) {
            console.error('Error fetching assigned workouts:', error)
            toast.error('Failed to load assigned workouts')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">My Workout Programs</h1>
                <p className="text-muted-foreground mt-2">
                    Workout templates assigned to you by your trainers
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading your workouts...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && workouts.length === 0 && (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No assigned workouts yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Your trainer will assign workout programs to you
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Workouts Grid */}
            {!isLoading && workouts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workouts.map((workout) => (
                        <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-xl line-clamp-2">{workout.name}</CardTitle>
                                    <Badge variant="secondary">{workout.difficulty}</Badge>
                                </div>
                                {workout.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                        {workout.description}
                                    </p>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Workout Info */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Dumbbell className="w-4 h-4" />
                                        <span>{workout.exercisesCount} exercises</span>
                                    </div>
                                    {workout.estimatedTime && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{workout.estimatedTime} min</span>
                                        </div>
                                    )}
                                </div>

                                {/* Trainer Info */}
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {workout.trainerName || 'Your Trainer'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {workout.trainerEmail}
                                        </p>
                                    </div>
                                </div>

                                {/* Assignment Date */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Assigned {formatDate(workout.assignedAt)}</span>
                                </div>

                                {/* Assignment Notes */}
                                {workout.assignmentNotes && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                                        <div className="flex gap-2">
                                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                    Trainer's Note
                                                </p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    {workout.assignmentNotes}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Button className="w-full" asChild>
                                    <Link href={`/workouts/${workout.id}`}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Workout
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
