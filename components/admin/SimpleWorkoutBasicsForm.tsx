'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Target, FileText, User } from 'lucide-react'

interface SimpleWorkoutBasicsFormProps {
    data: {
        name: string
        description?: string
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
        estimatedTime: number
        isTemplate: boolean
        isPublic: boolean
    }
    onUpdate: (data: any) => void
}

const DIFFICULTY_OPTIONS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
]

const TIME_PRESETS = [15, 30, 45, 60, 90, 120]

export function SimpleWorkoutBasicsForm({ data, onUpdate }: SimpleWorkoutBasicsFormProps) {
    const [localData, setLocalData] = useState(data)

    const handleChange = (field: string, value: any) => {
        const updated = { ...localData, [field]: value }
        setLocalData(updated)
        onUpdate(updated)
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Workout Basics</h2>
                <p className="text-muted-foreground">
                    Let's start with the basic information about your workout
                </p>
            </div>

            <div className="space-y-6">
                {/* Workout Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Workout Name *
                    </Label>
                    <Input
                        id="name"
                        value={localData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Upper Body Strength, HIIT Cardio"
                        className="text-lg"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        value={localData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe what this workout focuses on..."
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Difficulty and Time Row */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Difficulty */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Difficulty Level *
                        </Label>
                        <Select value={localData.difficulty} onValueChange={(value) => handleChange('difficulty', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Estimated Time */}
                    <div className="space-y-3">
                        <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Estimated Time (minutes) *
                        </Label>
                        <Input
                            id="estimatedTime"
                            type="number"
                            min="1"
                            max="300"
                            value={localData.estimatedTime}
                            onChange={(e) => handleChange('estimatedTime', parseInt(e.target.value) || 0)}
                            placeholder="30"
                        />

                        {/* Time Presets */}
                        <div className="flex flex-wrap gap-2">
                            {TIME_PRESETS.map((minutes) => (
                                <Button
                                    key={minutes}
                                    type="button"
                                    variant={localData.estimatedTime === minutes ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleChange('estimatedTime', minutes)}
                                    className="h-8"
                                >
                                    {minutes}min
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Workout Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Workout Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Template Setting */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Save as Template</h4>
                                <p className="text-sm text-muted-foreground">
                                    Make this workout available for future use
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant={localData.isTemplate ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleChange('isTemplate', !localData.isTemplate)}
                            >
                                {localData.isTemplate ? 'Yes' : 'No'}
                            </Button>
                        </div>

                        {/* Public Setting */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Make Public</h4>
                                <p className="text-sm text-muted-foreground">
                                    Share this workout with other users
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant={localData.isPublic ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleChange('isPublic', !localData.isPublic)}
                            >
                                {localData.isPublic ? 'Yes' : 'No'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
