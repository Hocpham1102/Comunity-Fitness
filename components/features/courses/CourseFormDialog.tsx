'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const CATEGORIES = [
    { value: 'STRENGTH_TRAINING', label: 'Strength Training' },
    { value: 'CARDIO', label: 'Cardio' },
    { value: 'YOGA', label: 'Yoga' },
    { value: 'PILATES', label: 'Pilates' },
    { value: 'HIIT', label: 'HIIT' },
    { value: 'BODYBUILDING', label: 'Bodybuilding' },
    { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
    { value: 'FLEXIBILITY', label: 'Flexibility' },
    { value: 'SPORTS_SPECIFIC', label: 'Sports Specific' },
    { value: 'GENERAL_FITNESS', label: 'General Fitness' },
]

const DIFFICULTIES = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
]

interface CourseFormData {
    title: string
    description: string
    shortDescription: string
    category: string
    difficulty: string
    price: string
    duration: string
    thumbnailUrl: string
    previewVideoUrl: string
    isPublished: boolean
}

const defaultForm: CourseFormData = {
    title: '',
    description: '',
    shortDescription: '',
    category: 'GENERAL_FITNESS',
    difficulty: 'BEGINNER',
    price: '0',
    duration: '',
    thumbnailUrl: '',
    previewVideoUrl: '',
    isPublished: false,
}

interface CourseFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    mode: 'create' | 'edit'
    courseId?: string
    initialData?: Partial<CourseFormData>
}

export default function CourseFormDialog({
    open, onOpenChange, onSuccess, mode, courseId, initialData,
}: CourseFormDialogProps) {
    const router = useRouter()
    const [form, setForm] = useState<CourseFormData>(defaultForm)
    const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            setErrors({})
            setForm(mode === 'edit' && initialData
                ? { ...defaultForm, ...initialData }
                : defaultForm
            )
        }
    }, [open, mode]) // eslint-disable-line react-hooks/exhaustive-deps

    const set = (field: keyof CourseFormData, value: string | boolean) =>
        setForm(prev => ({ ...prev, [field]: value }))

    const validate = (): boolean => {
        const errs: Partial<Record<keyof CourseFormData, string>> = {}
        if (!form.title.trim()) errs.title = 'Title is required'
        if (!form.description.trim()) errs.description = 'Description is required'
        if (!form.category) errs.category = 'Category is required'
        if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
            errs.price = 'Price must be 0 or more'
        if (form.duration && (isNaN(Number(form.duration)) || Number(form.duration) <= 0))
            errs.duration = 'Duration must be a positive number'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsSubmitting(true)
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                shortDescription: form.shortDescription?.trim() || null,
                category: form.category,
                difficulty: form.difficulty,
                price: Number(form.price),
                duration: form.duration ? Number(form.duration) : null,
                thumbnailUrl: form.thumbnailUrl?.trim() || null,
                previewVideoUrl: form.previewVideoUrl?.trim() || null,
                isPublished: form.isPublished,
            }

            const url = mode === 'edit' ? `/api/trainer/courses/${courseId}` : '/api/trainer/courses'
            const method = mode === 'edit' ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json()
                // Show Zod detail if available
                const detail = err.details?.[0]
                    ? ` (${err.details[0].path.join('.')}: ${err.details[0].message})`
                    : ''
                throw new Error((err.error || 'Failed to save course') + detail)
            }

            const created = await res.json()
            toast.success(mode === 'edit' ? 'Course updated!' : 'Course created! Now build your program.')
            onOpenChange(false)
            onSuccess()

            // After creating, go straight to the builder
            if (mode === 'create' && created?.id) {
                router.push(`/trainer/courses/${created.id}/builder`)
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label>Title <span className="text-destructive">*</span></Label>
                        <Input
                            placeholder="e.g. 12-Week Fat Loss Program"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    {/* Short Description */}
                    <div className="space-y-1.5">
                        <Label>
                            Short Description{' '}
                            <span className="text-muted-foreground text-xs">(shown in card preview)</span>
                        </Label>
                        <Input
                            placeholder="One-line summary..."
                            value={form.shortDescription}
                            onChange={e => set('shortDescription', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label>Full Description <span className="text-destructive">*</span></Label>
                        <Textarea
                            placeholder="Describe your course in detail — what students will learn, prerequisites, etc."
                            rows={4}
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>

                    {/* Category + Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Category <span className="text-destructive">*</span></Label>
                            <Select value={form.category} onValueChange={v => set('category', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Difficulty</Label>
                            <Select value={form.difficulty} onValueChange={v => set('difficulty', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DIFFICULTIES.map(d => (
                                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Price + Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Price (USD) <span className="text-destructive">*</span></Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.price}
                                onChange={e => set('price', e.target.value)}
                            />
                            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                Duration{' '}
                                <span className="text-muted-foreground text-xs">(hours, optional)</span>
                            </Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g. 10"
                                value={form.duration}
                                onChange={e => set('duration', e.target.value)}
                            />
                            {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                        </div>
                    </div>

                    {/* Thumbnail URL */}
                    <div className="space-y-1.5">
                        <Label>Thumbnail URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input
                            placeholder="https://..."
                            value={form.thumbnailUrl}
                            onChange={e => set('thumbnailUrl', e.target.value)}
                        />
                    </div>

                    {/* Preview Video URL */}
                    <div className="space-y-1.5">
                        <Label>Preview Video URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input
                            placeholder="https://youtube.com/..."
                            value={form.previewVideoUrl}
                            onChange={e => set('previewVideoUrl', e.target.value)}
                        />
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="font-medium text-sm">Publish Course</p>
                            <p className="text-xs text-muted-foreground">
                                Make this course visible to students
                            </p>
                        </div>
                        <Switch
                            checked={form.isPublished}
                            onCheckedChange={v => set('isPublished', v)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === 'edit' ? 'Save Changes' : 'Create Course'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
