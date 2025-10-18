'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SkipForward, Pause, Play, Plus } from 'lucide-react'

interface RestTimerProps {
  restTimeLeft: number
  isResting: boolean
  onSkipRest: () => void
  onAddTime: (seconds: number) => void
  onPause: () => void
  onResume: () => void
  isPaused?: boolean
}

export default function RestTimer({
  restTimeLeft,
  isResting,
  onSkipRest,
  onAddTime,
  onPause,
  onResume,
  isPaused = false
}: RestTimerProps) {
  const [displayTime, setDisplayTime] = useState(restTimeLeft)

  useEffect(() => {
    setDisplayTime(restTimeLeft)
  }, [restTimeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isResting) {
    return null
  }

  return (
    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-orange-400 mb-2">Rest Time</h3>
        
        {/* Large countdown display */}
        <div className="text-4xl font-bold text-orange-300 mb-4 font-mono">
          {formatTime(displayTime)}
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={onSkipRest}
            variant="outline"
            size="sm"
            className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>

          <Button
            onClick={isPaused ? onResume : onPause}
            variant="outline"
            size="sm"
            className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
          >
            {isPaused ? (
              <Play className="w-4 h-4 mr-1" />
            ) : (
              <Pause className="w-4 h-4 mr-1" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button
            onClick={() => onAddTime(30)}
            variant="outline"
            size="sm"
            className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            +30s
          </Button>
        </div>

        {/* Progress ring */}
        <div className="mt-4 flex justify-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-orange-500/20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-orange-400"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${(displayTime / (displayTime + restTimeLeft)) * 100}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
