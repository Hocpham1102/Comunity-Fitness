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

    try {
      // Submit set data
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

      if (!response.ok) throw new Error('Failed to log set')

      // Start rest timer if there are more sets
      if (currentSetNumber < currentExercise.sets) {
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
        // Move to next exercise
        if (currentExerciseIndex < totalExercises - 1) {
          setCurrentExerciseIndex(prev => prev + 1)
          setCurrentSetNumber(1)
        } else {
          // Workout complete
          toast.success('Workout completed! Great job!')
        }
      }
    } catch (error) {
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
          <CardTitle className="flex items-center justify-between">
            {currentExercise.exercise.name}
            <Badge variant="secondary">{currentExercise.exercise.difficulty}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {currentExercise.exercise.muscleGroups.map(group => (
              <Badge key={group} variant="outline">{group}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exercise Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sets:</span> {currentExercise.sets}
            </div>
            <div>
              <span className="text-muted-foreground">Reps:</span> {currentExercise.reps || 'N/A'}
            </div>
            <div>
              <span className="text-muted-foreground">Rest:</span> {currentExercise.rest || 60}s
            </div>
            <div>
              <span className="text-muted-foreground">Set:</span> {currentSetNumber} of {currentExercise.sets}
            </div>
          </div>

          {/* Set Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input
                type="number"
                placeholder="0"
                value={setData[`${currentExercise.exerciseId}-${currentSetNumber}`]?.weight || ''}
                onChange={(e) => {
                  const setKey = `${currentExercise.exerciseId}-${currentSetNumber}`
                  setSetData(prev => ({
                    ...prev,
                    [setKey]: { ...prev[setKey], weight: Number(e.target.value) }
                  }))
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reps</label>
              <Input
                type="number"
                placeholder="0"
                value={setData[`${currentExercise.exerciseId}-${currentSetNumber}`]?.reps || ''}
                onChange={(e) => {
                  const setKey = `${currentExercise.exerciseId}-${currentSetNumber}`
                  setSetData(prev => ({
                    ...prev,
                    [setKey]: { ...prev[setKey], reps: Number(e.target.value) }
                  }))
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handlePreviousExercise}
              variant="outline"
              disabled={currentExerciseIndex === 0}
            >
              <SkipBack className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleSetComplete}
              className="flex-1"
              disabled={isResting}
            >
              <Check className="w-4 h-4 mr-2" />
              Complete Set
            </Button>
            
            <Button
              onClick={handleNextExercise}
              variant="outline"
              disabled={currentExerciseIndex === totalExercises - 1}
            >
              Next
              <SkipForward className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
