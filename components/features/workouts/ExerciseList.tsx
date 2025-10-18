'use client'

import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SetLogger from './SetLogger'

interface Exercise {
  id: string
  name: string
  description: string | null
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

interface ExerciseListProps {
  readonly exercises: WorkoutExercise[]
  readonly currentExerciseIndex: number
  readonly onSelectExercise: (index: number) => void
  readonly completedExercises: Set<number>
  readonly isMobile?: boolean
  readonly currentSet?: number
  readonly totalSets?: number
  readonly targetReps?: number | null
  readonly onCompleteSet?: (weight: number, reps: number) => void
  readonly previousWeight?: number
  readonly previousReps?: number
  readonly isResting?: boolean
}

export default function ExerciseList({
  exercises,
  currentExerciseIndex,
  onSelectExercise,
  completedExercises,
  isMobile = false,
  currentSet,
  totalSets,
  targetReps,
  onCompleteSet,
  previousWeight,
  previousReps,
  isResting
}: ExerciseListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isMobile) {
    const currentExercise = exercises[currentExerciseIndex]

    return (
      <>
        {/* Collapsed bottom bar - chỉ hint, không có Set Logger */}
        {!isExpanded && (
          <button
            className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 w-full p-4 hover:bg-gray-700 transition-colors"
            onClick={() => setIsExpanded(true)}
            aria-label="Expand exercise list and set logger"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronUp className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">
                    {currentExerciseIndex + 1} of {exercises.length}
                  </div>
                  <div className="font-semibold text-white">
                    {currentExercise?.exercise.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Set {currentSet || 1} of {totalSets || 1} • Tap to open
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {currentExercise?.exercise.muscleGroups.slice(0, 2).map((group) => (
                  <Badge
                    key={group}
                    variant="outline"
                    className="text-xs px-2 py-0 border-gray-600 text-gray-300"
                  >
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          </button>
        )}

        {/* Expanded panel */}
        {isExpanded && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 animate-slide-up">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">Exercises</h3>
                <span className="text-sm text-gray-400">
                  {currentExerciseIndex + 1} of {exercises.length}
                </span>
              </div>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-700"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Set Logger in expanded state */}
            <div className="p-4 border-b border-gray-700">
              <SetLogger
                currentSet={currentSet || 1}
                totalSets={totalSets || 1}
                targetReps={targetReps}
                onCompleteSet={onCompleteSet || (() => {})}
                previousWeight={previousWeight}
                previousReps={previousReps}
                isResting={isResting}
              />
            </div>

            {/* Exercise list */}
            <div className="max-h-[50vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {exercises.map((workoutExercise, index) => {
                  const isCurrent = index === currentExerciseIndex
                  const isCompleted = completedExercises.has(index)
                  
                  return (
                    <button
                      key={workoutExercise.id}
                      onClick={() => {
                        onSelectExercise(index)
                        setIsExpanded(false)
                      }}
                      className={(() => {
                        if (isCurrent) return 'w-full text-left p-3 rounded-lg transition-colors bg-blue-600 text-white'
                        if (isCompleted) return 'w-full text-left p-3 rounded-lg transition-colors bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        return 'w-full text-left p-3 rounded-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600'
                      })()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {workoutExercise.exercise.name}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {workoutExercise.sets} sets × {workoutExercise.reps || 'N/A'} reps
                          </div>
                          <div className="flex gap-1 mt-1">
                            {workoutExercise.exercise.muscleGroups.slice(0, 2).map((group) => (
                              <Badge
                                key={group}
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <Check className="w-4 h-4 text-green-400" />
                          )}
                          <div className="text-xs opacity-75">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation arrows at bottom */}
            <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-700">
              <Button
                onClick={() => {
                  onSelectExercise(currentExerciseIndex - 1)
                  setIsExpanded(false)
                }}
                disabled={currentExerciseIndex === 0}
                variant="outline"
                size="sm"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                onClick={() => {
                  onSelectExercise(currentExerciseIndex + 1)
                  setIsExpanded(false)
                }}
                disabled={currentExerciseIndex === exercises.length - 1}
                variant="outline"
                size="sm"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Exercises</h3>
        
        <div className="space-y-2">
          {exercises.map((workoutExercise, index) => {
            const isCurrent = index === currentExerciseIndex
            const isCompleted = completedExercises.has(index)
            
            return (
              <button
                key={workoutExercise.id}
                onClick={() => onSelectExercise(index)}
                className={(() => {
                  if (isCurrent) return 'w-full text-left p-3 rounded-lg transition-colors bg-blue-600 text-white'
                  if (isCompleted) return 'w-full text-left p-3 rounded-lg transition-colors bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  return 'w-full text-left p-3 rounded-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600'
                })()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {workoutExercise.exercise.name}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {workoutExercise.sets} sets × {workoutExercise.reps || 'N/A'} reps
                    </div>
                    <div className="flex gap-1 mt-1">
                      {workoutExercise.exercise.muscleGroups.slice(0, 2).map((group) => (
                        <Badge
                          key={group}
                          variant="outline"
                          className="text-xs px-1 py-0"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                    <div className="text-xs opacity-75">
                      {index + 1}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
