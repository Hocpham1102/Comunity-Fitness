'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Save, Clock, Users, Target, FileText, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

// Step components (to be implemented)
import { WorkoutBasicsForm } from '@/components/features/workouts/WorkoutBasicsForm'
import { ExerciseSelector } from '@/components/features/workouts/ExerciseSelector'
import { ExerciseConfigurator } from '@/components/features/workouts/ExerciseConfigurator'
import { WorkoutReview } from '@/components/features/workouts/WorkoutReview'
import type { WorkoutFormData } from '@/lib/shared/schemas/workout-client.schema'
import { apiCreateWorkout } from '@/app/(client)/workouts/actions'

const STEPS = [
  { id: 1, title: 'Workout Basics', description: 'Name, description, and difficulty' },
  { id: 2, title: 'Add Exercises', description: 'Select exercises from library' },
  { id: 3, title: 'Configure Exercises', description: 'Sets, reps, and order' },
  { id: 4, title: 'Review & Save', description: 'Final review and save' },
]

const INITIAL_FORM_DATA: WorkoutFormData = {
  name: '',
  description: '',
  difficulty: 'BEGINNER',
  estimatedTime: 30,
  exercises: [],
  isTemplate: true,
  isPublic: false,
}

export default function CreateWorkoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [showDraftNotification, setShowDraftNotification] = useState(false)
  const [draftData, setDraftData] = useState<{ formData: WorkoutFormData; step: number } | null>(null)

  const [formData, setFormData] = useState<WorkoutFormData>(INITIAL_FORM_DATA)

  // Load draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('workout-draft')
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as { formData: WorkoutFormData; step: number }
        // Check if draft has meaningful data
        if (parsed.formData && (parsed.formData.name || parsed.formData.exercises.length > 0)) {
          setDraftData(parsed)
          setShowDraftNotification(true)
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }, [])

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
    console.log('prevStep called, currentStep:', currentStep)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      console.log('Moving to step:', currentStep - 1)
    } else {
      console.log('Already at step 1, cannot go back')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiCreateWorkout(formData as any)
      // Clear draft after successful save
      localStorage.removeItem('workout-draft')
      toast({
        title: 'Workout saved!',
        description: 'Your workout has been saved successfully.',
      })
      router.push('/workouts')
    } catch (error) {
      console.error('Error saving workout:', error)
      toast({
        title: 'Error',
        description: 'Failed to save workout. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadDraft = () => {
    if (draftData) {
      setFormData(draftData.formData)
      setCurrentStep(draftData.step)
      setShowDraftNotification(false)
      toast({
        title: 'Draft loaded',
        description: 'You can continue editing your workout.',
      })
    }
  }

  const handleStartFresh = () => {
    setShowDraftNotification(false)
    localStorage.removeItem('workout-draft')
    toast({
      title: 'Starting fresh',
      description: 'Previous draft has been cleared.',
    })
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/workouts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Workouts
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {formData.name || 'Create New Workout'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}
                </p>
              </div>
            </div>

            {/* Desktop: Save button */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Auto-save draft
                  localStorage.setItem('workout-draft', JSON.stringify({ formData, step: currentStep }))
                  toast({
                    title: 'Draft saved',
                    description: 'Your progress has been saved locally.',
                  })
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {showDraftNotification && draftData && (
        <div className="container mx-auto px-4 py-4">
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Draft Found
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    You have an unfinished workout: <strong>{draftData.formData.name || 'Untitled Workout'}</strong>
                    {draftData.formData.exercises.length > 0 && (
                      <span> • {draftData.formData.exercises.length} exercise{draftData.formData.exercises.length !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={handleLoadDraft}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Continue Editing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartFresh}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowDraftNotification(false)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
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
                {/* Mobile: Save Draft */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('workout-draft', JSON.stringify({ formData, step: currentStep }))
                    toast({
                      title: 'Draft saved',
                      description: 'Your progress has been saved locally.',
                    })
                  }}
                  className="md:hidden"
                >
                  <Save className="w-4 h-4" />
                </Button>

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
                    {isSaving ? 'Saving...' : 'Save Workout'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
