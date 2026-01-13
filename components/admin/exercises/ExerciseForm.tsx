'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, PlayCircle } from 'lucide-react'

// Enums manually mirrored from Prisma to avoid importing client directly in client component if needed, 
// but usually we can import types.
const MUSCLE_GROUPS = [
    'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS',
    'ABS', 'OBLIQUES', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES',
    'FULL_BODY', 'CARDIO'
]

const EQUIPMENT_TYPES = [
    'BARBELL', 'DUMBBELL', 'KETTLEBELL', 'CABLE', 'MACHINE',
    'BODYWEIGHT', 'RESISTANCE_BAND', 'CARDIO_EQUIPMENT', 'OTHER'
]

const DIFFICULTY_LEVELS = [
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
]

interface ExerciseFormProps {
    initialData?: {
        id?: string
        name: string
        description?: string | null
        instructions?: string | null
        muscleGroups: string[]
        equipment: string[]
        difficulty: string
        videoUrl?: string | null
        thumbnailUrl?: string | null
    }
}

export function ExerciseForm({ initialData }: ExerciseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        instructions: initialData?.instructions || '',
        muscleGroups: initialData?.muscleGroups || [] as string[],
        equipment: initialData?.equipment || [] as string[],
        difficulty: initialData?.difficulty || 'BEGINNER',
        videoUrl: initialData?.videoUrl || '',
        thumbnailUrl: initialData?.thumbnailUrl || '',
    })

    // Helper to formatting string for display
    const formatEnum = (str: string) => str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())

    const handleMuscleGroupToggle = (group: string) => {
        setFormData(prev => {
            const current = prev.muscleGroups
            if (current.includes(group)) {
                return { ...prev, muscleGroups: current.filter(g => g !== group) }
            } else {
                return { ...prev, muscleGroups: [...current, group] }
            }
        })
    }

    const handleEquipmentToggle = (item: string) => {
        setFormData(prev => {
            const current = prev.equipment
            if (current.includes(item)) {
                return { ...prev, equipment: current.filter(e => e !== item) }
            } else {
                return { ...prev, equipment: [...current, item] }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = initialData?.id
                ? `/api/exercises/${initialData.id}`
                : '/api/exercises'

            const method = initialData?.id ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to save exercise')
            }

            toast.success(initialData?.id ? 'Exercise updated' : 'Exercise created')
            router.push('/admin/exercises')
            router.refresh()
        } catch (error) {
            console.error('Error saving exercise:', error)
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={val => setFormData({ ...formData, difficulty: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTY_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>
                                        {formatEnum(level)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <div className="relative">
                            <PlayCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="videoUrl"
                                className="pl-9"
                                placeholder="https://youtube.com/..."
                                value={formData.videoUrl}
                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Link to a YouTube, Vimeo, or direct video file.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                            id="instructions"
                            value={formData.instructions}
                            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                            rows={6}
                            placeholder="Step-by-step instructions..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label>Muscle Groups *</Label>
                        <Card>
                            <CardContent className="p-4 h-[200px] overflow-y-auto grid grid-cols-2 gap-2">
                                {MUSCLE_GROUPS.map(group => (
                                    <div key={group} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`mg-${group}`}
                                            checked={formData.muscleGroups.includes(group)}
                                            onCheckedChange={() => handleMuscleGroupToggle(group)}
                                        />
                                        <Label htmlFor={`mg-${group}`} className="text-sm font-normal cursor-pointer">
                                            {formatEnum(group)}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <Label>Equipment</Label>
                        <Card>
                            <CardContent className="p-4 h-[200px] overflow-y-auto grid grid-cols-2 gap-2">
                                {EQUIPMENT_TYPES.map(item => (
                                    <div key={item} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`eq-${item}`}
                                            checked={formData.equipment.includes(item)}
                                            onCheckedChange={() => handleEquipmentToggle(item)}
                                        />
                                        <Label htmlFor={`eq-${item}`} className="text-sm font-normal cursor-pointer">
                                            {formatEnum(item)}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {formData.videoUrl && (
                        <div className="space-y-2">
                            <Label>Video Preview</Label>
                            <div className="aspect-video rounded-md overflow-hidden bg-black/10 border">
                                {formData.videoUrl.includes('youtube') || formData.videoUrl.includes('youtu.be') ? (
                                    <iframe
                                        src={formData.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <a href={formData.videoUrl} target="_blank" rel="noreferrer" className="flex items-center hover:underline">
                                            <PlayCircle className="w-5 h-5 mr-2" />
                                            Test Link
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData?.id ? 'Update Exercise' : 'Create Exercise'}
                </Button>
            </div>
        </form>
    )
}
