'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import ProgressHeader from './ProgressHeader'
import VideoPlayer from './VideoPlayer'
import ExerciseList from './ExerciseList'
import SetLogger from './SetLogger'
import RestTimer from './RestTimer'
import { Badge } from '@/components/ui/badge'

interface Exercise {
  id: string
  name: string
  description: string | null
  instructions: string | null
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
  videoUrl: string | null
  thumbnailUrl: string | null
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

interface VirtualGymProps {
  workoutLog: WorkoutLog
}

export default function VirtualGym({ workoutLog }: VirtualGymProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(workoutLog.currentExerciseOrder || 0)
  const [currentSetNumber, setCurrentSetNumber] = useState(workoutLog.currentSetNumber || 1)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  const [setData, setSetData] = useState<Record<string, { reps: number; weight: number }>>({})

  const currentExercise = workoutLog.workout.exercises[currentExerciseIndex]
  const totalExercises = workoutLog.workout.exercises.length

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
    if (!isResting || restTimeLeft <= 0 || isPaused) return

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
  }, [isResting, restTimeLeft, isPaused])

  const handleSetComplete = async (weight: number, reps: number) => {
    if (!currentExercise) return

    try {
      // Submit set data
      const response = await fetch(`/api/workout-logs/${workoutLog.id}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: currentExercise.exerciseId,
          setNumber: currentSetNumber,
          reps,
          weight,
          completed: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to log set')

      // Store set data for next set
      const setKey = `${currentExercise.exerciseId}-${currentSetNumber}`
      setSetData(prev => ({ ...prev, [setKey]: { reps, weight } }))

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
        setIsPaused(false)
      } else {
        // Exercise completed
        setCompletedExercises(prev => new Set([...prev, currentExerciseIndex]))
        
        // Move to next exercise
        if (currentExerciseIndex < totalExercises - 1) {
          setCurrentExerciseIndex(prev => prev + 1)
          setCurrentSetNumber(1)
        } else {
          // Workout complete
          toast.success('Workout completed! Great job!')
          // Complete workout
          await fetch(`/api/workout-logs/${workoutLog.id}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
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
    setIsPaused(false)
  }

  const handleAddTime = (seconds: number) => {
    setRestTimeLeft(prev => prev + seconds)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleSelectExercise = (index: number) => {
    if (index >= 0 && index < totalExercises) {
      setCurrentExerciseIndex(index)
      setCurrentSetNumber(1)
    }
  }

  const getPreviousSetData = () => {
    if (!currentExercise) return { weight: 0, reps: 0 }
    
    const prevSetKey = `${currentExercise.exerciseId}-${currentSetNumber - 1}`
    return setData[prevSetKey] || { weight: 0, reps: 0 }
  }

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">🏋️</div>
          <p className="text-lg">No exercises found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <ProgressHeader
        workoutName={workoutLog.title}
        currentExercise={currentExerciseIndex + 1}
        totalExercises={totalExercises}
        onExit={() => {}}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop: Exercise List Sidebar */}
        <div className="hidden lg:block">
          <ExerciseList
            exercises={workoutLog.workout.exercises}
            currentExerciseIndex={currentExerciseIndex}
            onSelectExercise={handleSelectExercise}
            completedExercises={completedExercises}
          />
        </div>

        {/* Center: Video and Exercise Info */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="p-4">
            <VideoPlayer
              videoUrl={currentExercise.exercise.videoUrl}
              thumbnailUrl={currentExercise.exercise.thumbnailUrl}
              exerciseName={currentExercise.exercise.name}
            />
          </div>

          {/* Exercise Info */}
          <div className="px-4 pb-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentExercise.exercise.name}
              </h2>
              
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  {currentExercise.exercise.difficulty}
                </Badge>
                {currentExercise.exercise.muscleGroups.map(group => (
                  <Badge key={group} variant="outline" className="border-gray-600 text-gray-300">
                    {group}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-6">
                <div>
                  <div className="font-semibold">Sets</div>
                  <div className="text-white">{currentExercise.sets}</div>
                </div>
                <div>
                  <div className="font-semibold">Reps</div>
                  <div className="text-white">{currentExercise.reps || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-semibold">Rest</div>
                  <div className="text-white">{currentExercise.rest || 60}s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Set Logger Sidebar */}
        <div className="hidden lg:block w-80 p-4">
          <SetLogger
            currentSet={currentSetNumber}
            totalSets={currentExercise.sets}
            targetReps={currentExercise.reps}
            onCompleteSet={handleSetComplete}
            previousWeight={getPreviousSetData().weight}
            previousReps={getPreviousSetData().reps}
            isResting={isResting}
          />
        </div>
      </div>

      {/* Mobile: Exercise Navigation */}
      <div className="lg:hidden">
        <ExerciseList
          exercises={workoutLog.workout.exercises}
          currentExerciseIndex={currentExerciseIndex}
          onSelectExercise={handleSelectExercise}
          completedExercises={completedExercises}
          isMobile={true}
        />
      </div>

      {/* Mobile/Tablet: Set Logger */}
      <div className="lg:hidden p-4">
        <SetLogger
          currentSet={currentSetNumber}
          totalSets={currentExercise.sets}
          targetReps={currentExercise.reps}
          onCompleteSet={handleSetComplete}
          previousWeight={getPreviousSetData().weight}
          previousReps={getPreviousSetData().reps}
          isResting={isResting}
        />
      </div>

      {/* Rest Timer */}
      <div className="p-4">
        <RestTimer
          restTimeLeft={restTimeLeft}
          isResting={isResting}
          onSkipRest={handleSkipRest}
          onAddTime={handleAddTime}
          onPause={handlePause}
          onResume={handleResume}
          isPaused={isPaused}
        />
      </div>
    </div>
  )
}
