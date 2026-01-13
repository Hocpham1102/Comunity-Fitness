'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Clock, Users, Target, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

// Step components
import { WorkoutBasicsForm } from '@/components/features/workouts/WorkoutBasicsForm'
import { ExerciseSelector } from '@/components/features/workouts/ExerciseSelector'
import { ExerciseConfigurator } from '@/components/features/workouts/ExerciseConfigurator'
import { WorkoutReview } from '@/components/features/workouts/WorkoutReview'
import type { WorkoutFormData } from '@/lib/shared/schemas/workout-client.schema'

const STEPS = [
    { id: 1, title: 'Workout Basics', description: 'Name, description, and difficulty' },
    { id: 2, title: 'Add Exercises', description: 'Select exercises from library' },
    { id: 3, title: 'Configure Exercises', description: 'Sets, reps, and order' },
    { id: 4, title: 'Review & Save', description: 'Final review and save' },
]

export default function AdminEditWorkoutPage() {
    const router = useRouter()
    const params = useParams()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const workoutId = params.id as string

    const [formData, setFormData] = useState<WorkoutFormData>({
        name: '',
        description: '',
        difficulty: 'BEGINNER',
        estimatedTime: 30,
        exercises: [],
        isTemplate: true,
        isPublic: true,
    })

    // Fetch existing workout data
    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const response = await fetch(`/api/workouts/${workoutId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch workout')
                }
                const workout = await response.json()

                // Admin can edit any workout including templates

                // Transform workout data to form format
                setFormData({
                    name: workout.name,
                    description: workout.description || '',
                    difficulty: workout.difficulty,
                    estimatedTime: workout.estimatedTime || 30,
                    exercises: workout.exercises?.map((we: any) => ({
                        exerciseId: we.exerciseId,
                        name: we.exercise?.name || '',
                        order: we.order,
                        sets: we.sets,
                        reps: we.reps || undefined,
                        duration: we.duration || undefined,
                        rest: we.rest || undefined,
                        notes: we.notes || undefined,
                    })) || [],
                    isTemplate: workout.isTemplate,
                    isPublic: workout.isPublic,
                })
            } catch (error) {
                console.error('Error fetching workout:', error)
                toast.error('Failed to load workout data.')
                router.push('/admin/workouts')
            } finally {
                setIsLoading(false)
            }
        }

        fetchWorkout()
    }, [workoutId, router])

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentStep])

    const updateFormData = useCallback((updates: Partial<WorkoutFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }, [])

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/workouts/${workoutId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to update workout')
            }

            toast.success('Workout template updated successfully!')
            router.push('/admin/workouts')
            router.refresh()
        } catch (error) {
            console.error('Error updating workout:', error)
            toast.error('Failed to update workout. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <WorkoutBasicsForm
                        data={{
                            name: formData.name,
                            description: formData.description ?? '',
                            difficulty: formData.difficulty,
                            estimatedTime: formData.estimatedTime,
                            isTemplate: formData.isTemplate,
                            isPublic: formData.isPublic,
                        }}
                        onUpdate={updateFormData}
                    />
                )
            case 2:
                return (
                    <ExerciseSelector
                        selectedExercises={formData.exercises}
                        onExercisesChange={(exercises) => updateFormData({ exercises })}
                    />
                )
            case 3:
                return (
                    <ExerciseConfigurator
                        exercises={formData.exercises}
                        onExercisesChange={(exercises) => updateFormData({ exercises })}
                    />
                )
            case 4:
                return (
                    <WorkoutReview
                        data={formData}
                        onEditStep={setCurrentStep}
                    />
                )
            default:
                return null
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.name.trim() !== ''
            case 2:
                return formData.exercises.length > 0
            case 3:
                return formData.exercises.every(ex => ex.sets > 0)
            case 4:
                return true
            default:
                return false
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading workout...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/workouts">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Workouts
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {formData.name || 'Edit Workout Template'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Step {currentStep} of {STEPS.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Progress Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${step.id === currentStep
                                            ? 'bg-primary/10 border border-primary/20'
                                            : step.id < currentStep
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-muted/50'
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.id === currentStep
                                                ? 'bg-primary text-primary-foreground'
                                                : step.id < currentStep
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {step.id < currentStep ? '✓' : step.id}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm">{step.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    {formData.exercises.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{formData.exercises.length} exercises</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{formData.estimatedTime} min estimated</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-primary" />
                                    <Badge variant="secondary" className="text-xs">
                                        {formData.difficulty}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Mobile Progress Indicator */}
                    <div className="lg:hidden mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                {STEPS[currentStep - 1].title}
                            </h2>
                            <Badge variant="outline">
                                {currentStep} / {STEPS.length}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`flex-1 h-2 rounded-full transition-colors ${step.id <= currentStep ? 'bg-primary' : 'bg-muted'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <Card>
                        <CardContent className="p-6">
                            {renderStepContent()}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-3">
                            {currentStep < STEPS.length ? (
                                <Button
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSaving ? 'Updating...' : 'Update Workout Template'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
