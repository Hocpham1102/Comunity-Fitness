'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export default function WorkoutFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '')
    const [timeLimit, setTimeLimit] = useState(searchParams.get('estimatedTimeLte') || '')
    const [workoutType, setWorkoutType] = useState(searchParams.get('isTemplate') || '')

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateURL({ q: searchQuery })
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const updateURL = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        // Update or remove parameters
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        // Always keep mine=true to show user's workouts
        if (!params.has('mine')) {
            params.set('mine', 'true')
        }

        router.push(`?${params.toString()}`, { scroll: false })
    }, [searchParams, router])

    const handleDifficultyChange = (value: string) => {
        setDifficulty(value)
        updateURL({ difficulty: value })
    }

    const handleTimeLimitChange = (value: string) => {
        setTimeLimit(value)
        updateURL({ estimatedTimeLte: value })
    }

    const handleWorkoutTypeChange = (value: string) => {
        setWorkoutType(value)
        updateURL({ isTemplate: value })
    }

    const clearFilters = () => {
        setSearchQuery('')
        setDifficulty('')
        setTimeLimit('')
        setWorkoutType('')
        router.push('?mine=true', { scroll: false })
    }

    const hasActiveFilters = searchQuery || difficulty || timeLimit || workoutType

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search workouts..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <Select value={difficulty} onValueChange={handleDifficultyChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={timeLimit} onValueChange={handleTimeLimitChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">≤ 30 min</SelectItem>
                        <SelectItem value="45">≤ 45 min</SelectItem>
                        <SelectItem value="60">≤ 60 min</SelectItem>
                        <SelectItem value="90">≤ 90 min</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={workoutType} onValueChange={handleWorkoutTypeChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Templates</SelectItem>
                        <SelectItem value="false">Custom</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <Filter className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    )
}
