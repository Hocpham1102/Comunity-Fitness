'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Play, Pause, SkipForward, SkipBack } from 'lucide-react'
import { toast } from 'sonner'

interface Exercise {
  id: string
  name: string
  description: string | null
  videoUrl: string | null
  thumbnailUrl: string | null
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
}

interface WorkoutExercise {
  id: string
  exerciseId: string
  order: number
  sets: number
  reps: number | null
  duration: number | null
  rest: number | null
  notes: string | null
  exercise: Exercise
}

interface WorkoutLog {
  id: string
  title: string
  currentExerciseOrder: number | null
  currentSetNumber: number | null
  restUntil: string | null
  workout: {
    exercises: WorkoutExercise[]
  }
}

interface ActiveWorkoutProps {
  workoutLog: WorkoutLog
}

export default function ActiveWorkout({ workoutLog }: ActiveWorkoutProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(workoutLog.currentExerciseOrder || 0)
  const [currentSetNumber, setCurrentSetNumber] = useState(workoutLog.currentSetNumber || 1)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [setData, setSetData] = useState<Record<string, { reps: number; weight: number }>>({})

  const currentExercise = workoutLog.workout.exercises[currentExerciseIndex]
  const totalExercises = workoutLog.workout.exercises.length
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100

  // Rest timer effect
  useEffect(() => {
    if (workoutLog.restUntil) {
      const restUntil = new Date(workoutLog.restUntil)
      const now = new Date()
      const timeLeft = Math.max(0, Math.floor((restUntil.getTime() - now.getTime()) / 1000))

      if (timeLeft > 0) {
        setRestTimeLeft(timeLeft)
        setIsResting(true)
      }
    }
  }, [workoutLog.restUntil])

  // Rest timer countdown
  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) return

    const timer = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          setIsResting(false)
          toast.success('Rest time is over! Ready for the next set?')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isResting, restTimeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSetComplete = async () => {
    if (!currentExercise) return

    const setKey = `${currentExercise.exerciseId}-${currentSetNumber}`
    const data = setData[setKey] || { reps: 0, weight: 0 }

    // Validate weight - must be non-negative (allow 0 for bodyweight exercises)
    if (data.weight == null || data.weight < 0) {
      toast.warning('Vui lòng nhập trọng lượng hợp lệ (không được âm)')
      return
    }

    // Validate reps - must be positive
    if (!data.reps || data.reps < 1) {
      toast.warning('Vui lòng nhập số lần lặp hợp lệ (phải lớn hơn 0)')
      return
    }

    console.log('=== handleSetComplete START ===')
    console.log('Current exercise:', currentExercise.exercise.name)
    console.log('Current set:', currentSetNumber, '/', currentExercise.sets)
    console.log('Current exercise index:', currentExerciseIndex, '/', totalExercises - 1)
    console.log('Set data:', data)

    try {
      // Submit set data
      console.log('Submitting set data...')
      const response = await fetch(`/api/workout-logs/${workoutLog.id}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: currentExercise.exerciseId,
          setNumber: currentSetNumber,
          reps: data.reps,
          weight: data.weight,
          completed: true,
        }),
      })

      if (!response.ok) {
        console.error('Set submission failed:', response.status, response.statusText)
        throw new Error('Failed to log set')
      }

      console.log('Set submitted successfully!')

      // Show success feedback for set completion
      toast.success(`Set ${currentSetNumber} completed!`)

      // Start rest timer if there are more sets
      if (currentSetNumber < currentExercise.sets) {
        console.log('More sets remaining, starting rest timer...')
        const restSeconds = currentExercise.rest || 60
        const restUntil = new Date(Date.now() + restSeconds * 1000)

        await fetch(`/api/workout-logs/${workoutLog.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentExerciseOrder: currentExerciseIndex,
            currentSetNumber: currentSetNumber + 1,
            restUntil: restUntil.toISOString(),
          }),
        })

        setCurrentSetNumber(prev => prev + 1)
        setRestTimeLeft(restSeconds)
        setIsResting(true)
      } else {
        console.log('Last set of exercise completed!')
        // Last set of current exercise completed
        if (currentExerciseIndex < totalExercises - 1) {
          console.log('Moving to next exercise...')
          // Move to next exercise
          toast.success(`${currentExercise.exercise.name} completed! Moving to next exercise...`)

          await fetch(`/api/workout-logs/${workoutLog.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentExerciseOrder: currentExerciseIndex + 1,
              currentSetNumber: 1,
              restUntil: null,
            }),
          })

          setCurrentExerciseIndex(prev => prev + 1)
          setCurrentSetNumber(1)
        } else {
          console.log('🎉 LAST SET OF LAST EXERCISE - WORKOUT COMPLETE!')
          // Last set of last exercise - workout complete!
          await fetch(`/api/workout-logs/${workoutLog.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentExerciseOrder: currentExerciseIndex,
              currentSetNumber: currentExercise.sets,
              restUntil: null,
            }),
          })

          console.log('Setting isWorkoutComplete to true...')
          setIsWorkoutComplete(true)
          toast.success('🎉 Workout completed! Great job!')
          console.log('Workout completion state set!')
        }
      }
      console.log('=== handleSetComplete END ===')
    } catch (error) {
      console.error('Error in handleSetComplete:', error)
      toast.error('Failed to log set')
      console.error(error)
    }
  }

  const handleSkipRest = () => {
    setIsResting(false)
    setRestTimeLeft(0)
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentSetNumber(1)
    }
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setCurrentSetNumber(1)
    }
  }

  const handleFinishWorkout = async () => {
    try {
      const response = await fetch(`/api/workout-logs/${workoutLog.id}/complete`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to complete workout')

      toast.success('Workout completed successfully!')
      // Redirect to workouts page
      window.location.href = '/workouts'
    } catch (error) {
      toast.error('Failed to complete workout')
      console.error(error)
    }
  }

  if (!currentExercise) {
    return <div>No exercises found</div>
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{workoutLog.title}</CardTitle>
            <Badge variant="outline">
              {currentExerciseIndex + 1} of {totalExercises}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Rest Timer */}
      {isResting && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Rest Time</h3>
            <div className="text-4xl font-bold text-orange-600 mb-4">
              {formatTime(restTimeLeft)}
            </div>
            <Button onClick={handleSkipRest} variant="outline">
              Skip Rest
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>{currentExercise.exercise.name}</CardTitle>
            <Badge variant="secondary">{currentExercise.exercise.difficulty}</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {currentExercise.exercise.muscleGroups.map(group => (
              <Badge key={group} variant="outline">{group}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exercise Video/Thumbnail */}
          {(currentExercise.exercise.videoUrl || currentExercise.exercise.thumbnailUrl) && (
            <div className="rounded-lg overflow-hidden bg-muted">
              {currentExercise.exercise.videoUrl ? (
                <video
                  src={currentExercise.exercise.videoUrl}
                  controls
                  className="w-full aspect-video object-cover"
                  poster={currentExercise.exercise.thumbnailUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              ) : currentExercise.exercise.thumbnailUrl ? (
                <img
                  src={currentExercise.exercise.thumbnailUrl}
                  alt={currentExercise.exercise.name}
                  className="w-full aspect-video object-cover"
                />
              ) : null}
            </div>
          )}

          {/* Exercise Description */}
          {currentExercise.exercise.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentExercise.exercise.description}
              </p>
            </div>
          )}

          {/* Exercise Info - Improved Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentExercise.sets}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Sets</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentExercise.reps || 'N/A'}</div>
              <div className="text-xs text-muted-foreground mt-1">Target Reps</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{currentExercise.rest || 60}s</div>
              <div className="text-xs text-muted-foreground mt-1">Rest Time</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
              <div className="text-2xl font-bold text-primary">{currentSetNumber}/{currentExercise.sets}</div>
              <div className="text-xs text-muted-foreground mt-1">Current Set</div>
            </div>
          </div>

          {/* Exercise Notes */}
          {currentExercise.notes && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">💡 Note:</span>
                <p className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                  {currentExercise.notes}
                </p>
              </div>
            </div>
          )}

          {/* Set Input - Improved Layout */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground">
              Record Set {currentSetNumber}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Weight (kg)
                  <span className="text-xs text-muted-foreground">(required)</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter weight (0 for bodyweight)"
                  step="0.5"
                  min="0"
                  value={setData[`${currentExercise.exerciseId}-${currentSetNumber}`]?.weight ?? ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    const setKey = `${currentExercise.exerciseId}-${currentSetNumber}`
                    setSetData(prev => ({
                      ...prev,
                      [setKey]: { ...prev[setKey], weight: isNaN(value) ? 0 : value }
                    }))
                  }}
                  className={(
                    setData[`${currentExercise.exerciseId}-${currentSetNumber}`]?.weight < 0
                  ) ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Reps Completed
                  <span className="text-xs text-muted-foreground">(required)</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter reps"
                  min="1"
                  step="1"
                  value={setData[`${currentExercise.exerciseId}-${currentSetNumber}`]?.reps || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (value < 1 || isNaN(value)) return
                    const setKey = `${currentExercise.exerciseId}-${currentSetNumber}`
                    setSetData(prev => ({
                      ...prev,
                      [setKey]: { ...prev[setKey], reps: value }
                    }))
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isWorkoutComplete ? (
            <div className="text-center space-y-4 pt-4">
              <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                  🎉 Congratulations!
                </h3>
                <p className="text-green-600 dark:text-green-500 mb-4">
                  You've completed all exercises!
                </p>
                <Button
                  onClick={handleFinishWorkout}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Finish Workout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePreviousExercise}
                variant="outline"
                disabled={currentExerciseIndex === 0}
                className="flex-1"
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleSetComplete}
                className="flex-[2]"
                disabled={isResting}
                size="lg"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Set
              </Button>

              <Button
                onClick={handleNextExercise}
                variant="outline"
                disabled={currentExerciseIndex === totalExercises - 1}
                className="flex-1"
              >
                Next
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
