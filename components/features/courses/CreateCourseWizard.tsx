'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    BookOpen, ChevronRight, Dumbbell, UtensilsCrossed, Plus,
    Trash2, Check, Flame, Clock, Loader2, X, Search,
    DollarSign, CalendarDays, ChevronDown, ChevronUp, SkipForward,
    CheckCircle2, ArrowLeft, ImageIcon, Video, Upload, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Constants ──────────────────────────────────────────────
const CATEGORIES = [
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

const CURRENCIES = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'VND', label: 'VND (₫)' },
    { value: 'EUR', label: 'EUR (€)' },
]

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DIFFICULTY_COLOR: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ADVANCED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// ─── Types ──────────────────────────────────────────────────
interface WorkoutTemplate {
    id: string
    name: string
    description?: string | null
    difficulty: string
    estimatedTime?: number | null
    exerciseCount: number
    approvalStatus?: string
}

interface MealPlanTemplate {
    id: string
    name: string
    description?: string | null
    targetCalories?: number | null
    mealCount: number
}

interface LocalSession {
    id: string // local temp id
    dayNumber: number
    type: 'workout' | 'meal'
    itemId: string
    itemName: string
    difficulty?: string
    estimatedTime?: number | null
    calories?: number | null
}

interface LocalWeek {
    id: string // local temp id
    weekNumber: number
    title: string
    sessions: LocalSession[]
}

type PickerTab = 'workout' | 'meal'
type SelectedTemplate =
    | { type: 'workout'; item: WorkoutTemplate }
    | { type: 'meal'; item: MealPlanTemplate }
    | null

// ─── Step 1: Course Info ─────────────────────────────────────
interface Step1Data {
    title: string
    shortDescription: string
    description: string
    category: string
    difficulty: string
    thumbnailUrl: string
    previewVideoUrl: string
}

const defaultStep1: Step1Data = {
    title: '',
    shortDescription: '',
    description: '',
    category: 'GENERAL_FITNESS',
    difficulty: 'BEGINNER',
    thumbnailUrl: '',
    previewVideoUrl: '',
}

// ─── Step 3: Pricing ─────────────────────────────────────────
interface Step3Data {
    price: string
    currency: string
    duration: string
    isPublished: boolean
}

const defaultStep3: Step3Data = {
    price: '0',
    currency: 'USD',
    duration: '',
    isPublished: false,
}

// ─── FileUploadZone ──────────────────────────────────────────
type UploadType = 'thumbnail' | 'video'

function FileUploadZone({
    type, value, onChange, label,
}: {
    type: UploadType
    value: string
    onChange: (url: string) => void
    label: string
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const accept = type === 'thumbnail'
        ? 'image/jpeg,image/png,image/webp,image/gif'
        : 'video/mp4,video/webm,video/ogg,video/quicktime'

    const uploadFile = useCallback(async (file: File) => {
        setIsUploading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('type', type === 'thumbnail' ? 'thumbnail' : 'video')
            const res = await fetch('/api/trainer/courses/upload', { method: 'POST', body: fd })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Upload failed')
            }
            const { url } = await res.json()
            onChange(url)
            toast.success(`${label} uploaded!`)
        } catch (e: any) {
            toast.error(e.message || 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }, [type, label, onChange])

    const handleFile = (file: File | undefined | null) => {
        if (!file) return
        uploadFile(file)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files[0])
    }

    const isImage = type === 'thumbnail'
    const Icon = isImage ? ImageIcon : Video
    const maxLabel = isImage ? '5MB max · JPG, PNG, WEBP' : '200MB max · MP4, WEBM'

    return (
        <div className="space-y-1.5">
            <Label>{label} <span className="text-muted-foreground text-xs">(optional)</span></Label>

            {value ? (
                <div className="relative rounded-xl overflow-hidden border bg-muted/20">
                    {isImage ? (
                        <img src={value} alt="Thumbnail preview"
                            className="w-full h-40 object-cover" />
                    ) : (
                        <video src={value} controls className="w-full h-40 object-cover" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-colors"
                            title="Replace file"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="bg-black/60 hover:bg-red-600 text-white rounded-lg p-1.5 transition-colors"
                            title="Remove"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => !isUploading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed h-36 cursor-pointer transition-all
                        ${isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}`}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <p className="text-xs text-muted-foreground">Uploading…</p>
                        </>
                    ) : (
                        <>
                            <div className={`rounded-full p-3 mb-2 ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
                                {isDragging
                                    ? <Upload className="w-5 h-5 text-primary" />
                                    : <Icon className="w-5 h-5 text-muted-foreground" />}
                            </div>
                            <p className="text-sm font-medium text-center">
                                {isDragging ? 'Drop to upload' : `Click or drag & drop ${label.toLowerCase()}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{maxLabel}</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
        </div>
    )
}

// ─── Stepper header ─────────────────────────────────────────
function StepHeader({ current }: { current: number }) {
    const steps = [
        { n: 1, label: 'Course Info', icon: BookOpen },
        { n: 2, label: 'Schedule', icon: CalendarDays },
        { n: 3, label: 'Pricing', icon: DollarSign },
    ]
    return (
        <div className="flex items-center justify-center gap-0 mb-6">
            {steps.map((s, idx) => {
                const Icon = s.icon
                const done = current > s.n
                const active = current === s.n
                return (
                    <div key={s.n} className="flex items-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                            ${active ? 'bg-primary text-primary-foreground shadow' : done ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {done
                                ? <Check className="w-3.5 h-3.5" />
                                : <Icon className="w-3.5 h-3.5" />
                            }
                            <span className="hidden sm:inline">{s.label}</span>
                            <span className="sm:hidden">{s.n}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <ChevronRight className={`w-4 h-4 mx-1 ${current > s.n ? 'text-primary' : 'text-muted-foreground/40'}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}


// ─── Workout pill ─────────────────────────────────────────────
function WorkoutPill({ w, isSelected, onSelect }: { w: WorkoutTemplate; isSelected: boolean; onSelect: () => void }) {
    const isPending = w.approvalStatus && w.approvalStatus !== 'APPROVED'
    return (
        <div onClick={onSelect}
            className={`group border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary/50 hover:bg-primary/5'}`}>
            <div className="flex items-start gap-2">
                <Dumbbell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-tight truncate">{w.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge className={`text-[10px] border-0 px-1.5 py-0 ${DIFFICULTY_COLOR[w.difficulty] ?? ''}`}>
                            {w.difficulty.charAt(0) + w.difficulty.slice(1).toLowerCase()}
                        </Badge>
                        {isPending && (
                            <Badge className="text-[10px] border-0 px-1.5 py-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Pending
                            </Badge>
                        )}
                        {w.estimatedTime && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />{w.estimatedTime}m
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{w.exerciseCount} exercises</span>
                    </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
            </div>
        </div>
    )
}

// ─── Meal plan pill ──────────────────────────────────────────
function MealPill({ m, isSelected, onSelect }: { m: MealPlanTemplate; isSelected: boolean; onSelect: () => void }) {
    return (
        <div onClick={onSelect}
            className={`group border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'hover:border-orange-300/60 hover:bg-orange-50/50'}`}>
            <div className="flex items-start gap-2">
                <UtensilsCrossed className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-tight truncate">{m.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        {m.targetCalories && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 text-orange-400" />{Math.round(m.targetCalories)} kcal
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{m.mealCount} foods</span>
                    </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
            </div>
        </div>
    )
}

// ─── Week card (local, no API yet) ───────────────────────────
function WeekCard({
    week, selected, onDeleteWeek, onDeleteSession, onAddSession, onClearSelection,
}: {
    week: LocalWeek
    selected: SelectedTemplate
    onDeleteWeek: (id: string) => void
    onDeleteSession: (weekId: string, sessionId: string) => void
    onAddSession: (weekId: string, dayNumber: number) => void
    onClearSelection: () => void
}) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="border rounded-xl overflow-hidden bg-card">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b">
                <button onClick={() => setCollapsed(c => !c)} className="text-muted-foreground hover:text-foreground">
                    {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <span className="flex-1 font-semibold text-sm">{week.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{week.sessions.length} sessions</span>
                <button onClick={() => onDeleteWeek(week.id)} className="text-destructive/60 hover:text-destructive p-1 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {!collapsed && (
                <div className="p-3 space-y-2">
                    {week.sessions.length > 0
                        ? week.sessions.map(s => (
                            <div key={s.id} className="flex gap-2 items-center border rounded-lg px-3 py-2 group bg-muted/20 hover:bg-muted/40 transition-colors">
                                <span className="w-9 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                                    {DAY_NAMES[s.dayNumber - 1]}
                                </span>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    {s.type === 'workout'
                                        ? <Dumbbell className="w-3 h-3 text-primary shrink-0" />
                                        : <UtensilsCrossed className="w-3 h-3 text-orange-500 shrink-0" />}
                                    <span className="text-sm font-medium truncate">{s.itemName}</span>
                                    {s.difficulty && (
                                        <Badge className={`text-[10px] border-0 px-1 py-0 ${DIFFICULTY_COLOR[s.difficulty] ?? ''}`}>
                                            {s.difficulty.charAt(0) + s.difficulty.slice(1).toLowerCase()}
                                        </Badge>
                                    )}
                                    {s.estimatedTime && (
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto shrink-0">
                                            <Clock className="w-2.5 h-2.5" />{s.estimatedTime}m
                                        </span>
                                    )}
                                    {s.calories && (
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto shrink-0">
                                            <Flame className="w-2.5 h-2.5 text-orange-400" />{Math.round(s.calories)} kcal
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => onDeleteSession(week.id, s.id)}
                                    className="opacity-0 group-hover:opacity-100 text-destructive/70 transition-opacity p-1 rounded shrink-0">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                        : (
                            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                No sessions yet — select a template and pick a day below.
                            </p>
                        )
                    }

                    {selected ? (
                        <div className={`mt-2 p-3 border rounded-lg ${selected.type === 'workout' ? 'border-primary/30 bg-primary/5' : 'border-orange-300/50 bg-orange-50/50 dark:bg-orange-900/10'}`}>
                            <p className={`text-xs font-medium mb-2 ${selected.type === 'workout' ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`}>
                                {selected.type === 'workout' ? <Dumbbell className="w-3 h-3 inline mr-1" /> : <UtensilsCrossed className="w-3 h-3 inline mr-1" />}
                                Adding <strong>{selected.item.name}</strong> — pick a day:
                            </p>
                            <div className="flex gap-1 flex-wrap">
                                {DAY_NAMES.map((day, i) => (
                                    <button key={day} onClick={() => onAddSession(week.id, i + 1)}
                                        className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${selected.type === 'workout'
                                            ? 'border-primary/40 hover:bg-primary hover:text-primary-foreground'
                                            : 'border-orange-400/40 hover:bg-orange-500 hover:text-white'}`}>
                                        {day}
                                    </button>
                                ))}
                                <button onClick={onClearSelection}
                                    className="px-2.5 py-1 text-xs rounded-md border text-muted-foreground hover:bg-muted transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center mt-1">
                            ← Select a template from the left to assign to a day
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── MAIN WIZARD ─────────────────────────────────────────────
interface CreateCourseWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function CreateCourseWizard({ open, onOpenChange, onSuccess }: CreateCourseWizardProps) {
    const [step, setStep] = useState(1)
    const [step1, setStep1] = useState<Step1Data>(defaultStep1)
    const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof Step1Data, string>>>({})
    const [step3, setStep3] = useState<Step3Data>(defaultStep3)
    const [step3Errors, setStep3Errors] = useState<Partial<Record<keyof Step3Data, string>>>({})

    // Wizard state
    const [createdCourseId, setCreatedCourseId] = useState<string | null>(null)
    const [isSubmittingStep1, setIsSubmittingStep1] = useState(false)
    const [isSubmittingFinal, setIsSubmittingFinal] = useState(false)
    const [isBuildingSchedule, setIsBuildingSchedule] = useState(false)

    // Schedule builder state (local)
    const [weeks, setWeeks] = useState<LocalWeek[]>([])
    const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([])
    const [mealPlans, setMealPlans] = useState<MealPlanTemplate[]>([])
    const [pickerTab, setPickerTab] = useState<PickerTab>('workout')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<SelectedTemplate>(null)
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

    // Reset on open
    useEffect(() => {
        if (open) {
            setStep(1)
            setStep1(defaultStep1)
            setStep1Errors({})
            setStep3(defaultStep3)
            setStep3Errors({})
            setCreatedCourseId(null)
            setWeeks([])
            setSelected(null)
            setSearch('')
            setPickerTab('workout')
        }
    }, [open])

    // Load templates when entering step 2
    const loadTemplates = useCallback(async (courseId: string) => {
        setIsLoadingTemplates(true)
        try {
            const [wRes, mRes] = await Promise.all([
                fetch(`/api/trainer/courses/${courseId}/workouts`),
                fetch(`/api/trainer/courses/${courseId}/meal-plans`),
            ])
            if (wRes.ok) {
                const d = await wRes.json()
                setWorkouts(d.workouts ?? [])
            }
            if (mRes.ok) {
                const d = await mRes.json()
                setMealPlans(d.mealPlans ?? [])
            }
        } catch {
            toast.error('Failed to load templates')
        } finally {
            setIsLoadingTemplates(false)
        }
    }, [])


    // ── Step 1: validate + create course draft ────────────────
    const validateStep1 = () => {
        const errs: Partial<Record<keyof Step1Data, string>> = {}
        if (!step1.title.trim()) errs.title = 'Title is required'
        if (!step1.description.trim()) errs.description = 'Description is required'
        if (!step1.category) errs.category = 'Category is required'
        setStep1Errors(errs)
        return Object.keys(errs).length === 0
    }

    const handleStep1Next = async () => {
        if (!validateStep1()) return
        setIsSubmittingStep1(true)
        try {
            const payload = {
                title: step1.title.trim(),
                description: step1.description.trim(),
                shortDescription: step1.shortDescription.trim() || null,
                category: step1.category,
                difficulty: step1.difficulty,
                price: 0, // placeholder; will be set in step 3
                currency: 'USD',
                thumbnailUrl: step1.thumbnailUrl.trim() || null,
                previewVideoUrl: step1.previewVideoUrl.trim() || null,
                isPublished: false,
            }
            const res = await fetch('/api/trainer/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to create course')
            }
            const created = await res.json()
            setCreatedCourseId(created.id)
            await loadTemplates(created.id)
            setStep(2)
        } catch (e: any) {
            toast.error(e.message || 'Something went wrong')
        } finally {
            setIsSubmittingStep1(false)
        }
    }

    // ── Step 2: local schedule management ────────────────────
    const addWeek = () => {
        const weekNumber = weeks.length + 1
        setWeeks(prev => [...prev, {
            id: `local-week-${Date.now()}`,
            weekNumber,
            title: `Week ${weekNumber}`,
            sessions: [],
        }])
    }

    const deleteWeek = (weekId: string) => {
        setWeeks(prev => prev.filter(w => w.id !== weekId).map((w, i) => ({ ...w, weekNumber: i + 1, title: w.title.startsWith('Week ') ? `Week ${i + 1}` : w.title })))
    }

    const addSession = (weekId: string, dayNumber: number) => {
        if (!selected) return
        const session: LocalSession = {
            id: `local-session-${Date.now()}-${Math.random()}`,
            dayNumber,
            type: selected.type,
            itemId: selected.item.id,
            itemName: selected.item.name,
            difficulty: selected.type === 'workout' ? (selected.item as WorkoutTemplate).difficulty : undefined,
            estimatedTime: selected.type === 'workout' ? (selected.item as WorkoutTemplate).estimatedTime : undefined,
            calories: selected.type === 'meal' ? (selected.item as MealPlanTemplate).targetCalories : undefined,
        }
        setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, sessions: [...w.sessions, session] } : w))
        setSelected(null)
        toast.success(`${selected.item.name} added to ${DAY_NAMES[dayNumber - 1]}`)
    }

    const deleteSession = (weekId: string, sessionId: string) => {
        setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, sessions: w.sessions.filter(s => s.id !== sessionId) } : w))
    }

    // Push local schedule to API
    const buildScheduleOnServer = async (courseId: string) => {
        if (weeks.length === 0) return
        setIsBuildingSchedule(true)
        try {
            for (const week of weeks) {
                const weekRes = await fetch(`/api/trainer/courses/${courseId}/weeks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: week.title }),
                })
                if (!weekRes.ok) continue
                const createdWeek = await weekRes.json()
                for (const session of week.sessions) {
                    const payload: any = { dayNumber: session.dayNumber }
                    if (session.type === 'workout') payload.workoutId = session.itemId
                    else payload.mealPlanId = session.itemId
                    await fetch(`/api/trainer/courses/${courseId}/weeks/${createdWeek.id}/sessions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })
                }
            }
        } finally {
            setIsBuildingSchedule(false)
        }
    }

    const handleStep2Next = async () => {
        if (createdCourseId && weeks.length > 0) {
            await buildScheduleOnServer(createdCourseId)
        }
        setStep(3)
    }

    // ── Step 3: validate + finalize ───────────────────────────
    const validateStep3 = () => {
        const errs: Partial<Record<keyof Step3Data, string>> = {}
        if (step3.price === '' || isNaN(Number(step3.price)) || Number(step3.price) < 0)
            errs.price = 'Price must be 0 or more'
        if (step3.duration && (isNaN(Number(step3.duration)) || Number(step3.duration) <= 0))
            errs.duration = 'Duration must be a positive number'
        setStep3Errors(errs)
        return Object.keys(errs).length === 0
    }

    const handleFinish = async () => {
        if (!validateStep3() || !createdCourseId) return
        setIsSubmittingFinal(true)
        try {
            const payload = {
                price: Number(step3.price),
                currency: step3.currency,
                duration: step3.duration ? Number(step3.duration) : null,
                isPublished: step3.isPublished,
            }
            const res = await fetch(`/api/trainer/courses/${createdCourseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to update course')
            }
            toast.success(step3.isPublished ? '🎉 Course created & published!' : 'Course created as draft!')
            onOpenChange(false)
            onSuccess()
        } catch (e: any) {
            toast.error(e.message || 'Something went wrong')
        } finally {
            setIsSubmittingFinal(false)
        }
    }

    // ── Helpers ───────────────────────────────────────────────
    const setS1 = (f: keyof Step1Data, v: string) => setStep1(p => ({ ...p, [f]: v }))
    const setS3 = (f: keyof Step3Data, v: string | boolean) => setStep3(p => ({ ...p, [f]: v }))

    const filteredWorkouts = workouts.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    const filteredMeals = mealPlans.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

    const totalSessions = weeks.reduce((s, w) => s + w.sessions.length, 0)

    // Format price preview
    const pricePreview = () => {
        const p = Number(step3.price)
        if (isNaN(p)) return ''
        if (p === 0) return 'Free'
        const sym = step3.currency === 'VND' ? '₫' : step3.currency === 'EUR' ? '€' : '$'
        return step3.currency === 'VND'
            ? `${p.toLocaleString('vi-VN')}${sym}`
            : `${sym}${p.toFixed(2)}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${step === 2 ? 'max-w-5xl' : 'max-w-2xl'} max-h-[92vh] overflow-hidden flex flex-col transition-all duration-300`}>
                <DialogHeader className="shrink-0">
                    <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                    <StepHeader current={step} />

                    {/* ── STEP 1: Course Info ── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label>Title <span className="text-destructive">*</span></Label>
                                <Input placeholder="e.g. 12-Week Fat Loss Program"
                                    value={step1.title} onChange={e => setS1('title', e.target.value)} />
                                {step1Errors.title && <p className="text-sm text-destructive">{step1Errors.title}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Short Description <span className="text-muted-foreground text-xs">(shown in card preview)</span></Label>
                                <Input placeholder="One-line summary..."
                                    value={step1.shortDescription} onChange={e => setS1('shortDescription', e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Full Description <span className="text-destructive">*</span></Label>
                                <Textarea placeholder="Describe your course in detail — what students will learn, prerequisites, etc."
                                    rows={4} value={step1.description} onChange={e => setS1('description', e.target.value)} />
                                {step1Errors.description && <p className="text-sm text-destructive">{step1Errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Category <span className="text-destructive">*</span></Label>
                                    <Select value={step1.category} onValueChange={v => setS1('category', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {step1Errors.category && <p className="text-sm text-destructive">{step1Errors.category}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Difficulty</Label>
                                    <Select value={step1.difficulty} onValueChange={v => setS1('difficulty', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {DIFFICULTIES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FileUploadZone
                                    type="thumbnail"
                                    label="Thumbnail Image"
                                    value={step1.thumbnailUrl}
                                    onChange={url => setS1('thumbnailUrl', url)}
                                />
                                <FileUploadZone
                                    type="video"
                                    label="Preview Video"
                                    value={step1.previewVideoUrl}
                                    onChange={url => setS1('previewVideoUrl', url)}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Schedule Builder ── */}
                    {step === 2 && (
                        <div className="flex gap-4 h-[calc(92vh-220px)]">
                            {/* Left: Template picker */}
                            <aside className="w-64 shrink-0 flex flex-col border rounded-xl overflow-hidden bg-card">
                                {/* Tabs */}
                                <div className="flex border-b shrink-0">
                                    <button onClick={() => { setPickerTab('workout'); setSearch('') }}
                                        className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${pickerTab === 'workout' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                        <Dumbbell className="w-3.5 h-3.5" /> Workouts
                                    </button>
                                    <button onClick={() => { setPickerTab('meal'); setSearch('') }}
                                        className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${pickerTab === 'meal' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                        <UtensilsCrossed className="w-3.5 h-3.5" /> Meals
                                    </button>
                                </div>
                                {/* Search */}
                                <div className="p-2 border-b shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                        <Input placeholder="Search..." className="pl-7 h-7 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                                    {isLoadingTemplates ? (
                                        <div className="flex flex-col items-center justify-center h-32 gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Loading templates…</p>
                                        </div>
                                    ) : pickerTab === 'workout' ? (
                                        filteredWorkouts.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Dumbbell className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-xs text-muted-foreground">
                                                    {workouts.length === 0 ? 'No workout templates yet' : 'No results'}
                                                </p>
                                            </div>
                                        ) : filteredWorkouts.map(w => (
                                            <WorkoutPill key={w.id} w={w}
                                                isSelected={selected?.type === 'workout' && selected.item.id === w.id}
                                                onSelect={() => setSelected(prev =>
                                                    prev?.type === 'workout' && prev.item.id === w.id ? null : { type: 'workout', item: w }
                                                )} />
                                        ))
                                    ) : (
                                        filteredMeals.length === 0 ? (
                                            <div className="text-center py-8">
                                                <UtensilsCrossed className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-xs text-muted-foreground">
                                                    {mealPlans.length === 0 ? 'No meal plans yet' : 'No results'}
                                                </p>
                                            </div>
                                        ) : filteredMeals.map(m => (
                                            <MealPill key={m.id} m={m}
                                                isSelected={selected?.type === 'meal' && selected.item.id === m.id}
                                                onSelect={() => setSelected(prev =>
                                                    prev?.type === 'meal' && prev.item.id === m.id ? null : { type: 'meal', item: m }
                                                )} />
                                        ))
                                    )}
                                </div>
                                {/* Selection status */}
                                {selected && (
                                    <div className={`p-2.5 border-t flex items-center gap-2 text-xs ${selected.type === 'workout' ? 'bg-primary/5' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                                        {selected.type === 'workout'
                                            ? <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                                            : <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                                        <p className="font-medium truncate flex-1">{selected.item.name}</p>
                                        <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </aside>

                            {/* Right: Weeks */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                                    <div>
                                        <p className="font-semibold text-sm">Course Schedule</p>
                                        <p className="text-xs text-muted-foreground">{weeks.length} weeks · {totalSessions} sessions</p>
                                    </div>
                                    <Button size="sm" onClick={addWeek} className="h-8">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Week
                                    </Button>
                                </div>

                                {weeks.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                        <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <h3 className="font-semibold text-sm mb-1">No weeks yet</h3>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Add weeks and assign workouts + meal plans to each day.<br />
                                            Or skip this step and build the schedule later.
                                        </p>
                                        <Button size="sm" onClick={addWeek}>
                                            <Plus className="w-4 h-4 mr-1.5" /> Add Week 1
                                        </Button>
                                    </div>
                                ) : (
                                    weeks.map(week => (
                                        <WeekCard
                                            key={week.id} week={week} selected={selected}
                                            onDeleteWeek={deleteWeek}
                                            onDeleteSession={deleteSession}
                                            onAddSession={addSession}
                                            onClearSelection={() => setSelected(null)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Pricing & Review ── */}
                    {step === 3 && (
                        <div className="space-y-5">
                            {/* Summary card */}
                            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" /> Course Summary
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Title</p>
                                        <p className="font-medium truncate">{step1.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Category / Difficulty</p>
                                        <p className="font-medium">
                                            {CATEGORIES.find(c => c.value === step1.category)?.label} · {' '}
                                            {DIFFICULTIES.find(d => d.value === step1.difficulty)?.label}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Schedule</p>
                                        <p className="font-medium">{weeks.length} weeks · {totalSessions} sessions</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className="font-medium">{step3.isPublished ? 'Published' : 'Draft'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price + Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Price <span className="text-destructive">*</span></Label>
                                    <Input type="number" min="0" step="1000"
                                        placeholder="0" value={step3.price}
                                        onChange={e => setS3('price', e.target.value)} />
                                    {step3Errors.price && <p className="text-sm text-destructive">{step3Errors.price}</p>}
                                    {step3.price && <p className="text-xs text-muted-foreground">{pricePreview()}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Currency</Label>
                                    <Select value={step3.currency} onValueChange={v => setS3('currency', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Duration <span className="text-muted-foreground text-xs">(hours, optional)</span></Label>
                                <Input type="number" min="1" placeholder="e.g. 10"
                                    value={step3.duration} onChange={e => setS3('duration', e.target.value)} />
                                {step3Errors.duration && <p className="text-sm text-destructive">{step3Errors.duration}</p>}
                            </div>

                            {/* Publish toggle */}
                            <div className="flex items-center justify-between rounded-xl border p-4 bg-card">
                                <div>
                                    <p className="font-medium text-sm">Publish Course</p>
                                    <p className="text-xs text-muted-foreground">Make this course visible to students immediately</p>
                                </div>
                                <Switch checked={step3.isPublished} onCheckedChange={v => setS3('isPublished', v)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer buttons ── */}
                <div className="flex items-center justify-between pt-4 border-t shrink-0">
                    <Button variant="outline" onClick={() => {
                        if (step === 1) onOpenChange(false)
                        else setStep(s => s - 1)
                    }}>
                        {step === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-1" /> Back</>}
                    </Button>

                    <div className="flex items-center gap-2">
                        {step === 2 && (
                            <Button variant="ghost" onClick={() => setStep(3)} disabled={isBuildingSchedule}
                                className="text-muted-foreground text-sm">
                                <SkipForward className="w-4 h-4 mr-1" /> Skip
                            </Button>
                        )}

                        {step === 1 && (
                            <Button onClick={handleStep1Next} disabled={isSubmittingStep1}>
                                {isSubmittingStep1 && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button onClick={handleStep2Next} disabled={isBuildingSchedule}>
                                {isBuildingSchedule && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isBuildingSchedule ? 'Saving schedule…' : <>Next <ChevronRight className="w-4 h-4 ml-1" /></>}
                            </Button>
                        )}

                        {step === 3 && (
                            <Button onClick={handleFinish} disabled={isSubmittingFinal}>
                                {isSubmittingFinal && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {step3.isPublished ? 'Publish Course' : 'Create Draft'}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
