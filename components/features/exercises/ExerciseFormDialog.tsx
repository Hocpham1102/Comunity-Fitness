'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface ExerciseFormData {
    name: string
    description: string
    instructions: string
    muscleGroups: string[]
    equipment: string[]
    difficulty: string
    videoUrl: string
    defaultReps?: number
    defaultWeight?: number
}

interface ExerciseFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    initialData?: ExerciseFormData
    exerciseId?: string
    mode: 'create' | 'edit'
}

const MUSCLE_GROUPS = [
    'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS',
    'FOREARMS', 'ABS', 'OBLIQUES', 'LOWER_BACK', 'QUADS',
    'HAMSTRINGS', 'CALVES', 'GLUTES', 'TRAPS', 'LATS'
]

const EQUIPMENT_TYPES = [
    'BARBELL', 'DUMBBELL', 'KETTLEBELL', 'CABLE', 'MACHINE',
    'BODYWEIGHT', 'RESISTANCE_BAND', 'MEDICINE_BALL', 'FOAM_ROLLER', 'OTHER'
]

const DIFFICULTY_LEVELS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
]

export default function ExerciseFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialData,
    exerciseId,
    mode,
}: ExerciseFormDialogProps) {
    const [formData, setFormData] = useState<ExerciseFormData>(
        initialData || {
            name: '',
            description: '',
            instructions: '',
            muscleGroups: [],
            equipment: [],
            difficulty: 'BEGINNER',
            videoUrl: '',
        }
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = mode === 'create'
                ? '/api/trainer/exercises'
                : `/api/trainer/exercises/${exerciseId}`

            const method = mode === 'create' ? 'POST' : 'PATCH'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to save exercise')
            }

            toast.success(
                mode === 'create'
                    ? 'Exercise created! Waiting for admin approval.'
                    : 'Exercise updated! Waiting for admin approval.'
            )
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to save exercise')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleMuscleGroup = (muscle: string) => {
        setFormData(prev => ({
            ...prev,
            muscleGroups: prev.muscleGroups.includes(muscle)
                ? prev.muscleGroups.filter(m => m !== muscle)
                : [...prev.muscleGroups, muscle]
        }))
    }

    const toggleEquipment = (equip: string) => {
        setFormData(prev => ({
            ...prev,
            equipment: prev.equipment.includes(equip)
                ? prev.equipment.filter(e => e !== equip)
                : [...prev.equipment, equip]
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create New Exercise' : 'Edit Exercise'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Exercise Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Barbell Bench Press"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the exercise"
                            rows={2}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                            id="instructions"
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder="Step-by-step instructions"
                            rows={4}
                        />
                    </div>

                    {/* Muscle Groups */}
                    <div className="space-y-2">
                        <Label>Muscle Groups *</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                            {MUSCLE_GROUPS.map((muscle) => (
                                <Badge
                                    key={muscle}
                                    variant={formData.muscleGroups.includes(muscle) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => toggleMuscleGroup(muscle)}
                                >
                                    {muscle.replace(/_/g, ' ')}
                                    {formData.muscleGroups.includes(muscle) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {formData.muscleGroups.length === 0 && (
                            <p className="text-sm text-destructive">Please select at least one muscle group</p>
                        )}
                    </div>

                    {/* Equipment */}
                    <div className="space-y-2">
                        <Label>Equipment *</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                            {EQUIPMENT_TYPES.map((equip) => (
                                <Badge
                                    key={equip}
                                    variant={formData.equipment.includes(equip) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => toggleEquipment(equip)}
                                >
                                    {equip.replace(/_/g, ' ')}
                                    {formData.equipment.includes(equip) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {formData.equipment.length === 0 && (
                            <p className="text-sm text-destructive">Please select at least one equipment type</p>
                        )}
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty *</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Video URL */}
                    <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="https://youtube.com/..."
                        />
                    </div>

                    {/* Default Reps and Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="defaultReps">Default Reps</Label>
                            <Input
                                id="defaultReps"
                                type="number"
                                min="1"
                                value={formData.defaultReps || ''}
                                onChange={(e) => setFormData({ ...formData, defaultReps: e.target.value ? Number(e.target.value) : undefined })}
                                placeholder="e.g., 10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defaultWeight">Default Weight (kg)</Label>
                            <Input
                                id="defaultWeight"
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.defaultWeight || ''}
                                onChange={(e) => setFormData({ ...formData, defaultWeight: e.target.value ? Number(e.target.value) : undefined })}
                                placeholder="e.g., 20"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || formData.muscleGroups.length === 0 || formData.equipment.length === 0}
                        >
                            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Exercise' : 'Update Exercise'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
