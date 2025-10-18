'use client'

import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  exercises: WorkoutExercise[]
  currentExerciseIndex: number
  onSelectExercise: (index: number) => void
  completedExercises: Set<number>
  isMobile?: boolean
}

export default function ExerciseList({
  exercises,
  currentExerciseIndex,
  onSelectExercise,
  completedExercises,
  isMobile = false
}: ExerciseListProps) {
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <Button
          onClick={() => onSelectExercise(currentExerciseIndex - 1)}
          disabled={currentExerciseIndex === 0}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <div className="text-sm text-gray-400">
            {currentExerciseIndex + 1} of {exercises.length}
          </div>
          <div className="font-semibold text-white">
            {exercises[currentExerciseIndex]?.exercise.name}
          </div>
        </div>

        <Button
          onClick={() => onSelectExercise(currentExerciseIndex + 1)}
          disabled={currentExerciseIndex === exercises.length - 1}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
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
