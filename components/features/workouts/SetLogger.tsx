'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'

interface SetLoggerProps {
  readonly currentSet: number
  readonly totalSets: number
  readonly targetReps: number | null
  readonly onCompleteSet: (weight: number, reps: number) => void
  readonly previousWeight?: number
  readonly previousReps?: number
  readonly isResting: boolean
}

export default function SetLogger({
  currentSet,
  totalSets,
  targetReps,
  onCompleteSet,
  previousWeight = 0,
  previousReps = 0,
  isResting
}: SetLoggerProps) {
  const [weight, setWeight] = useState(previousWeight.toString())
  const [reps, setReps] = useState(previousReps.toString())

  const handleCompleteSet = () => {
    const weightNum = Number.parseFloat(weight) || 0
    const repsNum = Number.parseInt(reps, 10) || 0
    
    if (repsNum <= 0) {
      alert('Please enter the number of reps completed')
      return
    }

    onCompleteSet(weightNum, repsNum)
    
    // Clear inputs for next set
    setWeight('')
    setReps('')
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Set {currentSet} of {totalSets}
        </h3>
        {targetReps && (
          <p className="text-gray-400">Target: {targetReps} reps</p>
        )}
      </div>

      <div className="space-y-4">
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
    </div>
  )
}
