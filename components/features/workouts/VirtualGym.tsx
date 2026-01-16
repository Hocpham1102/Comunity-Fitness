'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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

interface SetLog {
  id: string
  setNumber: number
  reps: number | null
  weight: number | null
  completed: boolean
}

interface ExerciseLog {
  id: string
  exerciseId: string
  sets: SetLog[]
}

interface WorkoutLog {
  id: string
  title: string
  currentExerciseOrder: number | null
  currentSetNumber: number | null
  restUntil: string | null
  startedAt: string
  updatedAt?: string | null
  workout: {
    exercises: WorkoutExercise[]
  }
  exerciseLogs?: ExerciseLog[]
}

interface VirtualGymProps {
  readonly workoutLog: WorkoutLog
}

export default function VirtualGym({ workoutLog }: VirtualGymProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(workoutLog.currentExerciseOrder || 0)
  const [currentSetNumber, setCurrentSetNumber] = useState(workoutLog.currentSetNumber || 1)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  const [setData, setSetData] = useState<Record<string, { reps: number; weight: number }>>({})
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)

  const currentExercise = workoutLog.workout.exercises[currentExerciseIndex]
  const totalExercises = workoutLog.workout.exercises.length

  // Load completed sets from exerciseLogs on mount
  useEffect(() => {
    if (!workoutLog.exerciseLogs || workoutLog.exerciseLogs.length === 0) return

    const newSetData: Record<string, { reps: number; weight: number }> = {}
    const newCompletedExercises = new Set<number>()

    // Process each exercise log
    workoutLog.exerciseLogs.forEach((exerciseLog) => {
      // Find the exercise index in the workout
      const exerciseIndex = workoutLog.workout.exercises.findIndex(
        (ex) => ex.exerciseId === exerciseLog.exerciseId
      )

      if (exerciseIndex === -1) return

      // Load all completed sets for this exercise
      exerciseLog.sets.forEach((set) => {
        if (set.completed && set.reps !== null && set.weight !== null) {
          const setKey = `${exerciseLog.exerciseId}-${set.setNumber}`
          newSetData[setKey] = {
            reps: set.reps,
            weight: set.weight,
          }
        }
      })

      // Check if all sets for this exercise are completed
      const exercise = workoutLog.workout.exercises[exerciseIndex]
      const completedSetsCount = exerciseLog.sets.filter((s) => s.completed).length
      if (completedSetsCount >= exercise.sets) {
        newCompletedExercises.add(exerciseIndex)
      }
    })

    setSetData(newSetData)
    setCompletedExercises(newCompletedExercises)
  }, [workoutLog])

  // Warn user if workout is stale (>24h inactive)
  useEffect(() => {
    if (!workoutLog.updatedAt && !workoutLog.startedAt) return

    const lastUpdate = new Date(workoutLog.updatedAt || workoutLog.startedAt)
    const hoursSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)

    if (hoursSince > 24) {
      toast.warning(
        `⚠️ This workout has been inactive for ${Math.floor(hoursSince)} hours. ` +
        `Make sure to warm up properly before continuing for muscle safety.`,
        { duration: 8000 }
      )
    }
  }, [workoutLog])

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
          console.log('🎉 Workout complete - last set of last exercise!')
          setCompletedExercises(prev => new Set([...prev, currentExerciseIndex]))
          setIsWorkoutComplete(true)
          toast.success('🎉 Workout completed! Great job!')
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

  const handleExit = async () => {
    try {
      // Save current progress before exiting
      await fetch(`/api/workout-logs/${workoutLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentExerciseOrder: currentExerciseIndex,
          currentSetNumber: currentSetNumber,
        }),
      })

      toast.success('Progress saved!')
      // Force redirect to progress page
      setTimeout(() => {
        window.location.href = '/progress'
      }, 500)
    } catch (error) {
      toast.error('Failed to save progress')
      console.error(error)
      // Still redirect even if save fails
      setTimeout(() => {
        window.location.href = '/progress'
      }, 500)
    }
  }

  // Workout completion screen
  if (isWorkoutComplete) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-900/20 to-black">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-2">Congratulations!</h1>
          <p className="text-xl text-gray-300 mb-6">
            You've completed all exercises!
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleFinishWorkout}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              size="lg"
            >
              ✅ Finish Workout
            </Button>
            <p className="text-sm text-gray-400">
              Your progress has been saved
            </p>
          </div>
        </div>
      </div>
    )
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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <ProgressHeader
        workoutName={workoutLog.title}
        currentExercise={currentExerciseIndex + 1}
        totalExercises={totalExercises}
        onExit={handleExit}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop: Exercise List Sidebar */}
        <div className="hidden lg:block lg:w-64 xl:w-72 border-r border-gray-800">
          <ExerciseList
            exercises={workoutLog.workout.exercises}
            currentExerciseIndex={currentExerciseIndex}
            onSelectExercise={handleSelectExercise}
            completedExercises={completedExercises}
          />
        </div>

        {/* Center: Video and Exercise Info */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-32 lg:pb-0">
          {/* Video Player */}
          <div className="p-4 lg:p-6">
            <VideoPlayer
              videoUrl={currentExercise.exercise.videoUrl}
              thumbnailUrl={currentExercise.exercise.thumbnailUrl}
              exerciseName={currentExercise.exercise.name}
            />
          </div>

          {/* Exercise Info */}
          <div className="px-4 lg:px-6 pb-4 space-y-6">
            {/* Exercise Header */}
            <div className="text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                {currentExercise.exercise.name}
              </h2>

              <div className="flex justify-center gap-2 flex-wrap mb-4">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  {currentExercise.exercise.difficulty}
                </Badge>
                {currentExercise.exercise.muscleGroups.map(group => (
                  <Badge key={group} variant="outline" className="border-gray-600 text-gray-300">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Exercise Stats - Improved Cards */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4 max-w-2xl mx-auto">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-1">Total Sets</div>
                <div className="text-2xl font-bold text-white">{currentExercise.sets}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-1">Target Reps</div>
                <div className="text-2xl font-bold text-white">{currentExercise.reps || 'N/A'}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-1">Rest Time</div>
                <div className="text-2xl font-bold text-white">{currentExercise.rest || 60}s</div>
              </div>
            </div>

            {/* Current Set Indicator */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4 text-center">
                <div className="text-sm text-orange-300 mb-1">Current Progress</div>
                <div className="text-3xl font-bold text-orange-400">
                  Set {currentSetNumber} of {currentExercise.sets}
                </div>
              </div>
            </div>

            {/* Exercise Description */}
            {currentExercise.exercise.description && (
              <div className="max-w-2xl mx-auto bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">📋 Description</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {currentExercise.exercise.description}
                </p>
              </div>
            )}

            {/* Exercise Instructions */}
            {currentExercise.exercise.instructions && (
              <div className="max-w-2xl mx-auto bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Instructions</h3>
                <p className="text-sm text-blue-200/80 leading-relaxed whitespace-pre-line">
                  {currentExercise.exercise.instructions}
                </p>
              </div>
            )}

            {/* Exercise Notes */}
            {currentExercise.notes && (
              <div className="max-w-2xl mx-auto bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/30">
                <h3 className="text-sm font-semibold text-yellow-300 mb-2">⚠️ Important Notes</h3>
                <p className="text-sm text-yellow-200/80 leading-relaxed">
                  {currentExercise.notes}
                </p>
              </div>
            )}

            {/* Equipment */}
            {currentExercise.exercise.equipment && currentExercise.exercise.equipment.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">🏋️ Equipment Needed</h3>
                <div className="flex gap-2 flex-wrap">
                  {currentExercise.exercise.equipment.map(item => (
                    <Badge key={item} variant="outline" className="border-gray-600 text-gray-300 bg-gray-800/30">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Set Logger Sidebar */}
        <div className="hidden lg:block lg:w-80 xl:w-96 border-l border-gray-800 bg-gray-900/50">
          <div className="h-full overflow-y-auto p-4 lg:p-6">
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
      </div>

      {/* Rest Timer - Above ExerciseList on mobile */}
      <div className="lg:hidden border-t border-gray-800 bg-gray-900 pb-20">
        <div className="p-2">
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

      {/* Mobile: Exercise Navigation with embedded Set Logger */}
      <div className="lg:hidden border-t border-gray-800 bg-gray-900/80">
        <ExerciseList
          exercises={workoutLog.workout.exercises}
          currentExerciseIndex={currentExerciseIndex}
          onSelectExercise={handleSelectExercise}
          completedExercises={completedExercises}
          isMobile={true}
          currentSet={currentSetNumber}
          totalSets={currentExercise.sets}
          targetReps={currentExercise.reps}
          onCompleteSet={handleSetComplete}
          previousWeight={getPreviousSetData().weight}
          previousReps={getPreviousSetData().reps}
          isResting={isResting}
        />
      </div>

      {/* Desktop: Rest Timer at bottom */}
      <div className="hidden lg:block border-t border-gray-800 bg-gray-900">
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
    </div>
  )
}
