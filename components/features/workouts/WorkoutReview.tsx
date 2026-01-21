'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Clock,
  Target,
  Dumbbell,
  Repeat,
  Users,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'
import { type WorkoutFormData } from '@/lib/shared/schemas/workout-client.schema'

interface WorkoutReviewProps {
  data: WorkoutFormData
  onEditStep: (step: number) => void
}

const DIFFICULTY_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-orange-100 text-orange-800',
  EXPERT: 'bg-red-100 text-red-800',
}

export function WorkoutReview({ data, onEditStep }: WorkoutReviewProps) {
  const totalSets = data.exercises.reduce((sum, ex) => sum + ex.sets, 0)
  const totalReps = data.exercises.reduce((sum, ex) => sum + (ex.reps || 0) * ex.sets, 0)
  const estimatedWorkoutTime = Math.round(
    data.exercises.reduce((sum, ex) => {
      const exerciseTime = (ex.duration || 30) * ex.sets
      const restTime = (ex.rest || 60) * (ex.sets - 1)
      return sum + exerciseTime + restTime
    }, 0) / 60
  )

  const validationIssues: string[] = []

  // Check for validation issues
  if (data.exercises.length === 0) {
    validationIssues.push('No exercises added')
  }

  if (data.exercises.some(ex => !ex.reps && !ex.duration)) {
    validationIssues.push('Some exercises missing reps or duration')
  }

  if (data.exercises.some(ex => ex.sets < 1)) {
    validationIssues.push('Some exercises have invalid sets')
  }

  const renderBasicsSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Workout Details
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditStep(1)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{data.name}</h3>
          {data.description && (
            <p className="text-muted-foreground mt-1">{data.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">{data.estimatedTime} minutes</div>
              <div className="text-sm text-muted-foreground">Estimated time</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <Badge className={DIFFICULTY_COLORS[data.difficulty]}>
                {DIFFICULTY_LABELS[data.difficulty]}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Difficulty</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">
                {data.isPublic ? 'Public' : 'Private'}
              </div>
              <div className="text-sm text-muted-foreground">Visibility</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{data.isTemplate ? 'Saved as template' : 'One-time workout'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderExercisesSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Exercises ({data.exercises.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditStep(2)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.exercises.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No exercises added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        <span>{exercise.sets} sets</span>
                      </div>
                      {exercise.reps && (
                        <div className="flex items-center gap-1">
                          <Dumbbell className="w-3 h-3" />
                          <span>{exercise.reps} reps</span>
                        </div>
                      )}
                      {exercise.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{exercise.duration}s</span>
                        </div>
                      )}
                      {exercise.rest && (
                        <span>{exercise.rest}s rest</span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditStep(3)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderStatsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Workout Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data.exercises.length}</div>
            <div className="text-sm text-muted-foreground">Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalSets}</div>
            <div className="text-sm text-muted-foreground">Total Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalReps}</div>
            <div className="text-sm text-muted-foreground">Total Reps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{estimatedWorkoutTime}</div>
            <div className="text-sm text-muted-foreground">Est. Minutes</div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="text-center">
          <div className="text-lg font-semibold">
            Actual vs Estimated Time
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="text-sm text-muted-foreground">
              Estimated: {data.estimatedTime} min
            </div>
            <div className="text-sm">
              Calculated: {estimatedWorkoutTime} min
            </div>
          </div>
          {Math.abs(estimatedWorkoutTime - data.estimatedTime) > 10 && (
            <div className="flex items-center gap-2 mt-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Time estimate may need adjustment</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderValidationSection = () => {
    if (validationIssues.length === 0) {
      return (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Ready to Save</h4>
                <p className="text-sm text-green-700">
                  Your workout looks great! All required fields are filled out.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            Issues to Fix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationIssues.map((issue, index) => (
              <div key={`issue-${index}-${issue}`} className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{issue}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-amber-700 mt-3">
            Please go back and fix these issues before saving your workout.
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderTipsSection = () => (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="w-5 h-5" />
          Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Start with lighter weights and gradually increase</li>
          <li>Take adequate rest between sets (60-90 seconds)</li>
          <li>Focus on proper form over heavy weights</li>
          <li>Warm up before starting your workout</li>
          <li>Cool down and stretch after completing</li>
        </ul>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Your Workout</h2>
        <p className="text-muted-foreground">
          Double-check everything looks good before saving
        </p>
      </div>

      {/* Validation Issues */}
      {renderValidationSection()}

      {/* Main Content */}
      <div className="space-y-6">
        {renderBasicsSection()}
        {renderExercisesSection()}
        {renderStatsSection()}
        {renderTipsSection()}
      </div>
    </div>
  )
}
