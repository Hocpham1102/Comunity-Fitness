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

    // Auto-collapse after completing set
    const handleCompleteSetWrapper = (weight: number, reps: number) => {
      if (onCompleteSet) {
        onCompleteSet(weight, reps)
        // Collapse the panel after completing set
        setIsExpanded(false)
      }
    }

    return (
      <>
        {/* Collapsed bottom bar - chỉ hint, không có Set Logger */}
        {!isExpanded && (
          <button
            className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 z-50 w-full hover:bg-gray-700 transition-colors active:bg-gray-700"
            style={{
              minHeight: 'max(3.125rem, calc(3.125rem + env(safe-area-inset-bottom)))', // 50px = 3.125rem
              paddingTop: 'clamp(0.25rem, 1.5vw, 0.5rem)',
              paddingBottom: 'max(clamp(0.25rem, 1.5vw, 0.5rem), calc(env(safe-area-inset-bottom) + 0.25rem))',
              paddingLeft: 'max(clamp(0.375rem, 2vw, 0.75rem), env(safe-area-inset-left))',
              paddingRight: 'max(clamp(0.375rem, 2vw, 0.75rem), env(safe-area-inset-right))',
            }}
            onClick={() => setIsExpanded(true)}
            aria-label="Expand exercise list and set logger"
          >
            <div className="flex items-center justify-between gap-1 sm:gap-1.5">
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 min-w-0 flex-1">
                <ChevronUp className="w-[0.875em] h-[0.875em] sm:w-[1em] sm:h-[1em] md:w-[1.25em] md:h-[1.25em] text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.5rem] sm:text-[0.5625rem] md:text-[0.625rem] text-gray-400 leading-[1.1]">
                    Ex {currentExerciseIndex + 1}/{exercises.length}
                  </div>
                  <div className="font-semibold text-white text-[0.625rem] sm:text-[0.6875rem] md:text-[0.75rem] truncate leading-[1.2]">
                    {currentExercise?.exercise.name}
                  </div>
                  <div className="text-[0.5rem] sm:text-[0.5625rem] text-gray-500 leading-[1.1]">
                    Set {currentSet || 1}/{totalSets || 1}
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5 flex-shrink-0 items-center">
                <Badge
                  variant="outline"
                  className="text-[0.4375rem] sm:text-[0.5rem] md:text-[0.5625rem] px-0.5 sm:px-1 py-0.5 border-gray-600 text-gray-300 whitespace-nowrap leading-none"
                >
                  {currentExercise?.exercise.muscleGroups[0]?.substring(0, 6) || 'N/A'}
                </Badge>
              </div>
            </div>
          </button>
        )}

        {/* Expanded panel */}
        {isExpanded && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 animate-slide-up"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }}
          >
            {/* Header with close button */}
            <div className="border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
              <div className="flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1 overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                    <h3 className="text-[0.75rem] sm:text-[0.875rem] md:text-[1rem] font-semibold text-white">Exercises</h3>
                    <span className="text-[0.5625rem] sm:text-[0.625rem] md:text-[0.75rem] text-gray-400">
                      {currentExerciseIndex + 1}/{exercises.length}
                    </span>
                    {currentSet && totalSets && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-[0.5625rem] sm:text-[0.625rem] md:text-[0.75rem] text-blue-400 font-medium">
                          Set {currentSet}/{totalSets}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="outline"
                  size="sm"
                  className="text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500 bg-gray-800 h-[1.75rem] sm:h-[2rem] md:h-[2.25rem] px-1.5 sm:px-2 md:px-3 ml-1.5 sm:ml-2 flex-shrink-0"
                >
                  <ChevronDown className="w-[1em] h-[1em] sm:w-[1.1em] sm:h-[1.1em] md:w-[1.25em] md:h-[1.25em] sm:mr-1 md:mr-1.5" />
                  <span className="hidden sm:inline text-[0.6875rem] sm:text-[0.75rem] md:text-[0.875rem] font-medium">Close</span>
                </Button>
              </div>
            </div>

            {/* Set Logger in expanded state */}
            <div className="px-2.5 py-2 sm:px-4 sm:py-3 border-b border-gray-700">
              <SetLogger
                currentSet={currentSet || 1}
                totalSets={totalSets || 1}
                targetReps={targetReps || null}
                onCompleteSet={handleCompleteSetWrapper}
                previousWeight={previousWeight}
                previousReps={previousReps}
                isResting={isResting || false}
                isMobile={true}
              />
            </div>

            {/* Exercise list with custom scrollbar */}
            <div
              className="overflow-y-auto px-2.5 py-2 sm:px-4 sm:py-3 exercise-list-scrollbar"
              style={{
                maxHeight: 'min(35vh, calc(100vh - 350px))',
                scrollbarWidth: 'auto',
                scrollbarColor: '#3B82F6 #1F2937'
              }}
            >
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
                        if (isCurrent) return 'w-full text-left p-2.5 sm:p-3 rounded-lg transition-colors bg-blue-600 text-white'
                        if (isCompleted) return 'w-full text-left p-2.5 sm:p-3 rounded-lg transition-colors bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        return 'w-full text-left p-2.5 sm:p-3 rounded-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600'
                      })()}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">
                            {workoutExercise.exercise.name}
                          </div>
                          <div className="text-[10px] sm:text-xs opacity-75 mt-0.5 sm:mt-1">
                            {workoutExercise.sets} sets × {workoutExercise.reps || 'N/A'} reps
                          </div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {workoutExercise.exercise.muscleGroups.slice(0, 2).map((group) => (
                              <Badge
                                key={group}
                                variant="outline"
                                className="text-[9px] sm:text-xs px-1 py-0"
                              >
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          {isCompleted && (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                          )}
                          <div className="text-[10px] sm:text-xs opacity-75 font-medium">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation arrows at bottom */}
            <div
              className="flex items-center justify-center gap-3 sm:gap-4 border-t border-gray-700 bg-gray-900/80"
              style={{
                paddingTop: '0.75rem',
                paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.25rem))',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              }}
            >
              <Button
                onClick={() => {
                  onSelectExercise(currentExerciseIndex - 1)
                  setIsExpanded(false)
                }}
                disabled={currentExerciseIndex === 0}
                variant="outline"
                size="sm"
                className="text-white font-semibold border-2 border-blue-500/60 bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400 disabled:opacity-40 disabled:border-gray-600 disabled:bg-gray-800 flex-1 max-w-[8.75rem] h-[2.25rem] sm:h-[2.5rem] transition-all"
              >
                <ChevronLeft className="w-[1em] h-[1em] mr-1" />
                <span className="text-[0.75rem] sm:text-[0.875rem]">Previous</span>
              </Button>

              <Button
                onClick={() => {
                  onSelectExercise(currentExerciseIndex + 1)
                  setIsExpanded(false)
                }}
                disabled={currentExerciseIndex === exercises.length - 1}
                variant="outline"
                size="sm"
                className="text-white font-semibold border-2 border-blue-500/60 bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400 disabled:opacity-40 disabled:border-gray-600 disabled:bg-gray-800 flex-1 max-w-[8.75rem] h-[2.25rem] sm:h-[2.5rem] transition-all"
              >
                <span className="text-[0.75rem] sm:text-[0.875rem]">Next</span>
                <ChevronRight className="w-[1em] h-[1em] ml-1" />
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div
      className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto exercise-list-scrollbar"
      style={{
        height: '100%',
        scrollbarWidth: 'auto',
        scrollbarColor: '#3B82F6 #1F2937'
      }}
    >
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
