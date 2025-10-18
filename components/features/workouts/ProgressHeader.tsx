'use client'

import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

interface ProgressHeaderProps {
  workoutName: string
  currentExercise: number
  totalExercises: number
  onExit: () => void
}

export default function ProgressHeader({ 
  workoutName, 
  currentExercise, 
  totalExercises, 
  onExit 
}: ProgressHeaderProps) {
  const router = useRouter()
  const progress = (currentExercise / totalExercises) * 100

  const handleExit = () => {
    if (confirm('Are you sure you want to exit the workout? Your progress will be saved.')) {
      onExit()
      router.push('/workouts')
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
      {/* Left side - Exit button */}
      <Button
        onClick={handleExit}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Exit</span>
      </Button>

      {/* Center - Workout name and progress */}
      <div className="flex-1 mx-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-white truncate">{workoutName}</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm text-gray-400">
              {currentExercise} of {totalExercises}
            </span>
            <div className="w-24">
              <Progress value={progress} className="h-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Settings */}
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-gray-800"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  )
}
