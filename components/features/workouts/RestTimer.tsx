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
    <div className="bg-orange-900/40 border-2 border-orange-500/50 rounded-lg p-2 md:p-6 shadow-lg">
      <div className="text-center">
        {/* Compact header for mobile */}
        <h3 className="text-sm md:text-xl font-bold text-orange-300 mb-1 md:mb-4 uppercase tracking-wide">Rest Time</h3>

        {/* Countdown - Compact on mobile, large on desktop */}
        <div className="text-5xl md:text-7xl font-bold text-orange-400 mb-2 md:mb-6 font-mono drop-shadow-lg">
          {formatTime(displayTime)}
        </div>

        {/* Status indicator - compact */}
        {isPaused && (
          <div className="mb-1 md:mb-2 text-orange-300 font-semibold text-sm">
            ⏸️ Paused
          </div>
        )}

        {/* Control buttons - Compact but with full text */}
        <div className="flex flex-row justify-center gap-2 md:gap-3">
          <Button
            onClick={onSkipRest}
            variant="outline"
            size="sm"
            className="border-2 border-orange-500 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 font-semibold text-xs md:text-base px-2 md:px-4"
          >
            <SkipForward className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="text-xs md:text-base">Skip</span>
          </Button>

          <Button
            onClick={isPaused ? onResume : onPause}
            variant="outline"
            size="sm"
            className="border-2 border-orange-500 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 font-semibold text-xs md:text-base px-2 md:px-4"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
                <span className="text-xs md:text-base">Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
                <span className="text-xs md:text-base">Pause</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => onAddTime(30)}
            variant="outline"
            size="sm"
            className="border-2 border-orange-500 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 font-semibold text-xs md:text-base px-2 md:px-4"
          >
            <Plus className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="text-xs md:text-base">+30s</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
