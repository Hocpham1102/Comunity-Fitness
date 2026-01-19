'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

interface SetLoggerProps {
  readonly currentSet: number
  readonly totalSets: number
  readonly targetReps: number | null
  readonly onCompleteSet: (weight: number, reps: number) => void
  readonly previousWeight?: number
  readonly previousReps?: number
  readonly isResting: boolean
  readonly isMobile?: boolean
}

export default function SetLogger({
  currentSet,
  totalSets,
  targetReps,
  onCompleteSet,
  previousWeight = 0,
  previousReps = 0,
  isResting,
  isMobile = false
}: SetLoggerProps) {
  const [weight, setWeight] = useState(previousWeight.toString())
  const [reps, setReps] = useState(previousReps.toString())
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-expand when moving to next set
  useEffect(() => {
    if (isMobile && !isResting) {
      setIsCollapsed(false)
    }
  }, [currentSet, isMobile, isResting])

  const handleCompleteSet = () => {
    const weightNum = Number.parseFloat(weight) || 0
    const repsNum = Number.parseInt(reps, 10) || 0


    if (weightNum <= 0) {
      alert('Please enter the weight')
      return
    }

    if (repsNum <= 0) {
      alert('Please enter the number of reps completed')
      return
    }

    onCompleteSet(weightNum, repsNum)

    // Clear inputs for next set
    setWeight('')
    setReps('')

    // Auto-collapse on mobile after completing set
    if (isMobile) {
      setIsCollapsed(true)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="text-[0.875rem] sm:text-[1rem] md:text-[1.125rem] font-semibold text-white truncate">
            Set {currentSet} of {totalSets}
          </h3>
          {targetReps && !isCollapsed && (
            <p className="text-[0.6875rem] sm:text-[0.75rem] md:text-[0.875rem] text-gray-400 truncate">
              Target: {targetReps} reps
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white h-auto p-1 sm:p-1.5 md:p-2 ml-1 sm:ml-2 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(!isCollapsed)
          }}
        >
          {isCollapsed ? (
            <ChevronUp className="w-[1.25em] h-[1.25em] sm:w-[1.5em] sm:h-[1.5em]" />
          ) : (
            <ChevronDown className="w-[1.25em] h-[1.25em] sm:w-[1.5em] sm:h-[1.5em]" />
          )}
        </Button>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4">
          {/* Weight input */}
          <div>
            <label htmlFor="weight-input" className="block text-sm font-medium text-gray-300 mb-2">
              Weight (kg)
            </label>
            <Input
              id="weight-input"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isResting}
            />
          </div>

          {/* Reps input */}
          <div>
            <label htmlFor="reps-input" className="block text-sm font-medium text-gray-300 mb-2">
              Reps Completed
            </label>
            <Input
              id="reps-input"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isResting}
            />
          </div>

          {/* Complete set button */}
          <Button
            onClick={handleCompleteSet}
            disabled={isResting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
          >
            <Check className="w-5 h-5 mr-2" />
            Complete Set {currentSet}
          </Button>

          {/* Previous set info */}
          {(previousWeight > 0 || previousReps > 0) && (
            <div className="text-center text-sm text-gray-400">
              Last set: {previousWeight}kg × {previousReps} reps
            </div>
          )}
        </div>
      )}
    </div>
  )
}
