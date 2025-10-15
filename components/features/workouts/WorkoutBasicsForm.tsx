'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workoutBasicsSchema, type WorkoutBasics } from '@/lib/shared/schemas/workout-client.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, FileText, User } from 'lucide-react'

interface WorkoutBasicsFormProps {
  readonly data: {
    name: string
    description?: string
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
    estimatedTime: number
    isTemplate: boolean
    isPublic: boolean
  }
  readonly onUpdate: (data: Partial<WorkoutBasics>) => void
}

const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Perfect for getting started' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Some experience required' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Challenging workouts' },
  { value: 'EXPERT', label: 'Expert', description: 'Maximum intensity' },
]

const TIME_PRESETS = [15, 30, 45, 60, 90, 120]

export function WorkoutBasicsForm({ data, onUpdate }: WorkoutBasicsFormProps) {
  const {
    register,
    setValue,
    control,
    formState: { errors, isValid }
  } = useForm<WorkoutBasics>({
    resolver: zodResolver(workoutBasicsSchema),
    defaultValues: data,
    mode: 'onChange'
  })

  // Watch only the fields we care about to reduce re-renders
  const [name, description, difficulty, estimatedTime, isTemplate, isPublic] = useWatch({
    control,
    name: ['name', 'description', 'difficulty', 'estimatedTime', 'isTemplate', 'isPublic']
  })

  const current = useMemo(
    () => ({
      name: name ?? '',
      description,
      difficulty,
      estimatedTime: estimatedTime ?? 0,
      isTemplate: isTemplate ?? true,
      isPublic: isPublic ?? false,
    }),
    [name, description, difficulty, estimatedTime, isTemplate, isPublic]
  )

  // Keep onUpdate stable via ref to avoid effect loop when parent recreates it
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  // Emit only when values actually change and are valid
  const lastEmittedRef = useRef<string>('')
  useEffect(() => {
    if (!isValid) return
    const snapshot = JSON.stringify(current)
    if (snapshot !== lastEmittedRef.current) {
      lastEmittedRef.current = snapshot
      onUpdateRef.current(current)
    }
  }, [isValid, current])

  const handleDifficultyChange = (value: string) => {
    setValue('difficulty', value as any, { shouldValidate: true })
  }

  const handleTimePreset = (minutes: number) => {
    setValue('estimatedTime', minutes, { shouldValidate: true })
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setValue('estimatedTime', value, { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Workout Basics</h2>
        <p className="text-muted-foreground">
          Let's start with the basic information about your workout
        </p>
      </div>

      <form className="space-y-6">
        {/* Workout Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Workout Name *
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Upper Body Strength, HIIT Cardio"
            className="text-lg"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe what this workout focuses on..."
            rows={3}
            className="resize-none"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Difficulty and Time Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Difficulty */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Difficulty Level *
            </Label>
            <Select value={current.difficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-sm text-destructive">{errors.difficulty.message}</p>
            )}
          </div>

          {/* Estimated Time */}
          <div className="space-y-3">
            <Label htmlFor="estimatedTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Estimated Time (minutes) *
            </Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              max="300"
              value={current.estimatedTime}
              onChange={handleTimeChange}
              placeholder="30"
            />
            {errors.estimatedTime && (
              <p className="text-sm text-destructive">{errors.estimatedTime.message}</p>
            )}
            
            {/* Time Presets */}
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={current.estimatedTime === minutes ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimePreset(minutes)}
                  className="h-8"
                >
                  {minutes}min
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Workout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Workout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Setting */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Save as Template</h4>
                <p className="text-sm text-muted-foreground">
                  Make this workout available for future use
                </p>
              </div>
              <Button
                type="button"
                variant={current.isTemplate ? "default" : "outline"}
                size="sm"
                onClick={() => setValue('isTemplate', !current.isTemplate)}
              >
                {current.isTemplate ? 'Yes' : 'No'}
              </Button>
            </div>

            {/* Public Setting */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Make Public</h4>
                <p className="text-sm text-muted-foreground">
                  Share this workout with other users
                </p>
              </div>
              <Button
                type="button"
                variant={current.isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setValue('isPublic', !current.isPublic)}
              >
                {current.isPublic ? 'Yes' : 'No'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {current.name && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold">{current.name}</h3>
                <Badge variant="secondary">
                  {DIFFICULTY_OPTIONS.find(d => d.value === current.difficulty)?.label}
                </Badge>
              </div>
              
              {current.description && (
                <p className="text-muted-foreground">{current.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{current.estimatedTime} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{current.isTemplate ? 'Template' : 'One-time'}</span>
                </div>
                {current.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
