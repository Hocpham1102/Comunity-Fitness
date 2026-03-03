'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Clock, Users, Target, Loader2, RotateCcw, X, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

const DRAFT_KEY = 'trainer_workout_draft'

const DEFAULT_FORM: WorkoutFormData = {
    name: '',
    description: '',
    difficulty: 'BEGINNER',
    estimatedTime: 30,
    exercises: [],
    isTemplate: true,
    isPublic: false,
}

interface SavedDraft {
    formData: WorkoutFormData
    currentStep: number
    savedAt: string
}

export default function TrainerCreateWorkoutPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [draftBanner, setDraftBanner] = useState<SavedDraft | null>(null)
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

    const [formData, setFormData] = useState<WorkoutFormData>(DEFAULT_FORM)

    // On mount — check for existing draft
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY)
            if (raw) {
                const draft: SavedDraft = JSON.parse(raw)
                // Only show banner if there's a meaningful draft (at least a name)
                if (draft.formData?.name?.trim()) {
                    setDraftBanner(draft)
                }
            }
        } catch {
            // corrupt draft — ignore
        }
    }, [])

    // Auto-save draft whenever formData or step changes
    useEffect(() => {
        // Don't save an empty draft
        if (!formData.name.trim() && formData.exercises.length === 0) return

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = setTimeout(() => {
            try {
                const draft: SavedDraft = {
                    formData,
                    currentStep,
                    savedAt: new Date().toISOString(),
                }
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
            } catch {
                // storage full or unavailable — ignore silently
            }
        }, 800) // debounce 800ms
    }, [formData, currentStep])

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        }
    }, [])

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentStep])

    const restoreDraft = () => {
        if (!draftBanner) return
        setFormData(draftBanner.formData)
        setCurrentStep(draftBanner.currentStep)
        setDraftBanner(null)
        toast.success('Draft restored!')
    }

    const discardDraft = () => {
        localStorage.removeItem(DRAFT_KEY)
        setDraftBanner(null)
    }

    const clearDraftAndReset = () => {
        localStorage.removeItem(DRAFT_KEY)
        setFormData(DEFAULT_FORM)
        setCurrentStep(1)
    }

    const updateFormData = useCallback((updates: Partial<WorkoutFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }, [])

    const nextStep = () => {
        if (currentStep < STEPS.length) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/trainer/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                const msg = errData?.message || errData?.error || 'Failed to create workout'
                const detail = errData?.errors?.[0]
                    ? ` (${errData.errors[0].path.join('.')}: ${errData.errors[0].message})`
                    : ''
                throw new Error(msg + detail)
            }

            // Clear draft on success
            localStorage.removeItem(DRAFT_KEY)

            toast.success('Workout template created successfully!')
            router.push('/trainer/workouts')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating workout:', error)
            toast.error(error?.message || 'Failed to create workout. Please try again.')
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
            case 1: return formData.name.trim() !== ''
            case 2: return formData.exercises.length > 0
            case 3: return formData.exercises.every(ex => ex.sets > 0)
            case 4: return true
            default: return false
        }
    }

    const hasDraftInProgress = formData.name.trim() !== '' || formData.exercises.length > 0

    return (
        <div className="space-y-6">
            {/* Draft restore banner */}
            {draftBanner && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
                    <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            Unsaved draft found: &ldquo;{draftBanner.formData.name}&rdquo;
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            Saved at step {draftBanner.currentStep} · {new Date(draftBanner.savedAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={restoreDraft}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                        </Button>
                        <Button size="sm" variant="ghost" onClick={discardDraft}
                            className="text-amber-700 hover:text-amber-900 text-xs h-8">
                            <X className="w-3 h-3 mr-1" />
                            Discard
                        </Button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/trainer/workouts">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Templates
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Workout Template</h1>
                        <p className="text-sm text-muted-foreground">
                            Step {currentStep} of {STEPS.length}
                        </p>
                    </div>
                </div>

                {/* Auto-save indicator */}
                {hasDraftInProgress && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Save className="w-3 h-3" />
                        <span>Auto-saving draft…</span>
                    </div>
                )}
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
                                            ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
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

                    {/* Discard draft CTA */}
                    {hasDraftInProgress && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearDraftAndReset}
                            className="mt-4 w-full text-muted-foreground hover:text-destructive text-xs"
                        >
                            <X className="w-3 h-3 mr-1" />
                            Start over / clear draft
                        </Button>
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
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Workout Template'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
