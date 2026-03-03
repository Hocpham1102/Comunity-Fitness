'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    ArrowLeft, Plus, Trash2, Dumbbell, Clock, Search, Loader2,
    ChevronDown, ChevronUp, BookOpen, CheckCircle2, X,
    Edit2, UtensilsCrossed, DollarSign, Flame, Layers,
} from 'lucide-react'
import { toast } from 'sonner'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DIFFICULTY_COLOR: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ADVANCED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

interface WorkoutTemplate {
    id: string
    name: string
    description?: string | null
    difficulty: string
    estimatedTime?: number | null
    exerciseCount: number
}

interface MealPlanTemplate {
    id: string
    name: string
    description?: string | null
    targetCalories?: number | null
    targetProtein?: number | null
    targetCarbs?: number | null
    targetFats?: number | null
    mealCount: number
}

interface CourseSession {
    id: string
    dayNumber: number
    order: number
    title?: string | null
    notes?: string | null
    workoutId?: string | null
    mealPlanId?: string | null
    workout?: {
        id: string; name: string; difficulty: string
        estimatedTime?: number | null
        _count: { exercises: number }
    } | null
    mealPlan?: {
        id: string; name: string
        targetCalories?: number | null
        targetProtein?: number | null
        targetCarbs?: number | null
        targetFats?: number | null
    } | null
}

interface CourseWeek {
    id: string; weekNumber: number; title?: string | null; sessions: CourseSession[]
}

interface Course {
    id: string; title: string; price: number; currency: string; isPublished: boolean
    weeks: CourseWeek[]
}

type PickerTab = 'workout' | 'meal'
type SelectedItem =
    | { type: 'workout'; item: WorkoutTemplate }
    | { type: 'meal'; item: MealPlanTemplate }
    | null

// ── Workout pill ──────────────────────────────────────────
function WorkoutPill({ w, isSelected, onSelect }: { w: WorkoutTemplate; isSelected: boolean; onSelect: () => void }) {
    return (
        <div onClick={onSelect}
            className={`group border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary hover:bg-primary/5'}`}>
            <div className="flex items-start gap-2">
                <Dumbbell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-tight truncate">{w.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge className={`text-[10px] border-0 px-1.5 py-0 ${DIFFICULTY_COLOR[w.difficulty] ?? ''}`}>
                            {w.difficulty.charAt(0) + w.difficulty.slice(1).toLowerCase()}
                        </Badge>
                        {w.estimatedTime && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />{w.estimatedTime}m
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{w.exerciseCount} exercises</span>
                    </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            </div>
        </div>
    )
}

// ── Meal plan pill ────────────────────────────────────────
function MealPill({ m, isSelected, onSelect }: { m: MealPlanTemplate; isSelected: boolean; onSelect: () => void }) {
    return (
        <div onClick={onSelect}
            className={`group border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'hover:border-orange-300 hover:bg-orange-50/50'}`}>
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
                {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
            </div>
        </div>
    )
}

// ── Session row inside a week ─────────────────────────────
function SessionRow({ session, courseId, weekId, onDelete }: {
    session: CourseSession; courseId: string; weekId: string; onDelete: (id: string) => void
}) {
    const w = session.workout
    const m = session.mealPlan
    return (
        <div className="flex gap-2 items-start border rounded-lg px-3 py-2.5 group bg-muted/30 hover:bg-muted/50 transition-colors">
            {/* Day */}
            <div className="w-9 shrink-0 pt-0.5 text-center">
                <span className="text-xs font-semibold text-muted-foreground">{DAY_NAMES[session.dayNumber - 1]}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                {/* Workout */}
                {w && (
                    <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">{session.title || w.name}</span>
                        <Badge className={`text-[10px] border-0 px-1 py-0 ml-auto ${DIFFICULTY_COLOR[w.difficulty] ?? ''}`}>
                            {w.difficulty.charAt(0) + w.difficulty.slice(1).toLowerCase()}
                        </Badge>
                        {w.estimatedTime && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                <Clock className="w-2.5 h-2.5" />{w.estimatedTime}m
                            </span>
                        )}
                    </div>
                )}
                {/* Meal plan */}
                {m && (
                    <div className="flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3 h-3 text-orange-500 shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{m.name}</span>
                        {m.targetCalories && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto shrink-0">
                                <Flame className="w-2.5 h-2.5 text-orange-400" />{Math.round(m.targetCalories)} kcal
                            </span>
                        )}
                    </div>
                )}
                {/* Rest day */}
                {!w && !m && (
                    <span className="text-sm text-muted-foreground italic">Rest / Free day</span>
                )}
                {/* Notes */}
                {session.notes && (
                    <p className="text-xs text-muted-foreground italic truncate">{session.notes}</p>
                )}
            </div>

            {/* Delete */}
            <button
                onClick={() => onDelete(session.id)}
                className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity p-1 rounded shrink-0 mt-0.5"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

// ── Week card ─────────────────────────────────────────────
function WeekCard({ week, courseId, selected, onDeleteWeek, onDeleteSession, onAddSession, onClearSelection }: {
    week: CourseWeek; courseId: string; selected: SelectedItem
    onDeleteWeek: (id: string) => void
    onDeleteSession: (weekId: string, sessionId: string) => void
    onAddSession: (weekId: string, dayNumber: number) => void
    onClearSelection: () => void
}) {
    const [collapsed, setCollapsed] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [title, setTitle] = useState(week.title ?? `Week ${week.weekNumber}`)

    const handleTitleSave = async () => {
        setEditingTitle(false)
        await fetch(`/api/trainer/courses/${courseId}/weeks/${week.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        }).catch(() => toast.error('Failed to update title'))
    }

    return (
        <div className="border rounded-xl overflow-hidden bg-card">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b">
                <button onClick={() => setCollapsed(c => !c)} className="text-muted-foreground hover:text-foreground">
                    {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {editingTitle ? (
                    <Input autoFocus value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                        className="h-7 text-sm font-semibold flex-1" />
                ) : (
                    <button className="flex-1 text-left font-semibold text-sm flex items-center gap-2 group" onClick={() => setEditingTitle(true)}>
                        {title}
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                )}
                <span className="text-xs text-muted-foreground shrink-0">{week.sessions.length} sessions</span>
                <button onClick={() => onDeleteWeek(week.id)} className="text-destructive/60 hover:text-destructive p-1 rounded shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {!collapsed && (
                <div className="p-4 space-y-2">
                    {week.sessions.length > 0
                        ? week.sessions.map(s => (
                            <SessionRow
                                key={s.id} session={s} courseId={courseId} weekId={week.id}
                                onDelete={(id) => onDeleteSession(week.id, id)}
                            />
                        ))
                        : (
                            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                No sessions yet — select a template and pick a day below.
                            </p>
                        )
                    }

                    {/* Day picker when something is selected */}
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
                                <button onClick={onClearSelection} className="px-2.5 py-1 text-xs rounded-md border text-muted-foreground hover:bg-muted transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center mt-1">
                            ← Select a template to assign to a day
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function CourseBuilderPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.id as string

    const [course, setCourse] = useState<Course | null>(null)
    const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([])
    const [mealPlans, setMealPlans] = useState<MealPlanTemplate[]>([])
    const [search, setSearch] = useState('')
    const [pickerTab, setPickerTab] = useState<PickerTab>('workout')
    const [selected, setSelected] = useState<SelectedItem>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddingWeek, setIsAddingWeek] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [isTogglingPublish, setIsTogglingPublish] = useState(false)

    const fetchCourse = useCallback(async () => {
        try {
            const res = await fetch(`/api/trainer/courses/${courseId}`)
            if (!res.ok) {
                let errMsg = `Error ${res.status}`
                try {
                    const errData = await res.json()
                    errMsg = errData.error || errMsg
                } catch { }
                toast.error(`Could not load course: ${errMsg}`)
                setTimeout(() => router.push('/trainer/courses'), 2000)
                return
            }
            const data = await res.json()
            setCourse(data)
            setIsPublished(data.isPublished)
        } catch (e: any) {
            toast.error(`Failed to load course: ${e.message}`)
        } finally {
            setIsLoading(false)
        }
    }, [courseId, router])

    const fetchWorkouts = useCallback(async () => {
        const res = await fetch(`/api/trainer/courses/${courseId}/workouts`).catch(() => null)
        if (res?.ok) {
            const d = await res.json()
            setWorkouts(d.workouts ?? [])
        }
    }, [courseId])

    const fetchMealPlans = useCallback(async () => {
        const res = await fetch(`/api/trainer/courses/${courseId}/meal-plans`).catch(() => null)
        if (res?.ok) {
            const d = await res.json()
            setMealPlans(d.mealPlans ?? [])
        }
    }, [courseId])

    useEffect(() => {
        fetchCourse()
        fetchWorkouts()
        fetchMealPlans()
    }, [fetchCourse, fetchWorkouts, fetchMealPlans])

    const filteredWorkouts = workouts.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    const filteredMeals = mealPlans.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

    const handleTogglePublish = async () => {
        setIsTogglingPublish(true)
        const res = await fetch(`/api/trainer/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: !isPublished }),
        }).catch(() => null)
        if (res?.ok) {
            setIsPublished(p => !p)
            toast.success(isPublished ? 'Course unpublished' : 'Course published!')
        } else {
            toast.error('Failed to update')
        }
        setIsTogglingPublish(false)
    }

    const handleAddWeek = async () => {
        setIsAddingWeek(true)
        const res = await fetch(`/api/trainer/courses/${courseId}/weeks`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
        }).catch(() => null)
        if (res?.ok) { await fetchCourse(); toast.success('Week added!') }
        else toast.error('Failed to add week')
        setIsAddingWeek(false)
    }

    const handleDeleteWeek = async (weekId: string) => {
        if (!confirm('Delete this week and all its sessions?')) return
        const res = await fetch(`/api/trainer/courses/${courseId}/weeks/${weekId}`, { method: 'DELETE' }).catch(() => null)
        if (res?.ok) { await fetchCourse(); toast.success('Week deleted') }
        else toast.error('Failed to delete week')
    }

    const handleAddSession = async (weekId: string, dayNumber: number) => {
        if (!selected) return
        const payload: any = { dayNumber }
        if (selected.type === 'workout') payload.workoutId = selected.item.id
        else payload.mealPlanId = selected.item.id

        const res = await fetch(`/api/trainer/courses/${courseId}/weeks/${weekId}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(() => null)

        if (res?.ok) {
            await fetchCourse()
            setSelected(null)
            toast.success(`${selected.item.name} added to ${DAY_NAMES[dayNumber - 1]}`)
        } else {
            toast.error('Failed to add session')
        }
    }

    const handleDeleteSession = async (weekId: string, sessionId: string) => {
        const res = await fetch(`/api/trainer/courses/${courseId}/weeks/${weekId}/sessions/${sessionId}`, {
            method: 'DELETE',
        }).catch(() => null)
        if (res?.ok) await fetchCourse()
        else toast.error('Failed to remove session')
    }

    const totalSessions = course?.weeks.reduce((s, w) => s + w.sessions.length, 0) ?? 0

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    }
    if (!course) return null

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            {/* ── Top bar ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
                <Link href="/trainer/courses">
                    <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
                </Link>

                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg truncate">{course.title}</h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {course.weeks.length}w · {totalSessions} sessions
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                            <DollarSign className="w-3 h-3 text-primary" />
                            {course.price === 0 ? 'Free' : `${course.currency} ${course.price.toFixed(2)}`}
                        </span>
                        <Link href="/trainer/courses" className="text-primary hover:underline text-xs">Edit price & info →</Link>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{isPublished ? 'Published' : 'Draft'}</span>
                    <Switch checked={isPublished} onCheckedChange={handleTogglePublish} disabled={isTogglingPublish} />
                </div>
            </div>

            {/* ── Two-panel layout ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Template Picker */}
                <aside className="w-72 border-r bg-card flex flex-col shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => { setPickerTab('workout'); setSearch('') }}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${pickerTab === 'workout' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <Dumbbell className="w-3.5 h-3.5" /> Workouts
                        </button>
                        <button
                            onClick={() => { setPickerTab('meal'); setSearch('') }}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${pickerTab === 'meal' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <UtensilsCrossed className="w-3.5 h-3.5" /> Meal Plans
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {pickerTab === 'workout' ? (
                            filteredWorkouts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Dumbbell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {workouts.length === 0 ? 'No approved workout templates' : 'No results'}
                                    </p>
                                    {workouts.length === 0 && (
                                        <Link href="/trainer/workouts"><Button size="sm" variant="outline" className="mt-3 text-xs">Create Templates</Button></Link>
                                    )}
                                </div>
                            ) : filteredWorkouts.map(w => (
                                <WorkoutPill key={w.id} w={w}
                                    isSelected={selected?.type === 'workout' && selected.item.id === w.id}
                                    onSelect={() => setSelected(prev => prev?.type === 'workout' && prev.item.id === w.id ? null : { type: 'workout', item: w })}
                                />
                            ))
                        ) : (
                            filteredMeals.length === 0 ? (
                                <div className="text-center py-8">
                                    <UtensilsCrossed className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {mealPlans.length === 0 ? 'No meal plans yet' : 'No results'}
                                    </p>
                                    {mealPlans.length === 0 && (
                                        <Link href="/trainer/nutrition"><Button size="sm" variant="outline" className="mt-3 text-xs">Create Meal Plans</Button></Link>
                                    )}
                                </div>
                            ) : filteredMeals.map(m => (
                                <MealPill key={m.id} m={m}
                                    isSelected={selected?.type === 'meal' && selected.item.id === m.id}
                                    onSelect={() => setSelected(prev => prev?.type === 'meal' && prev.item.id === m.id ? null : { type: 'meal', item: m })}
                                />
                            ))
                        )}
                    </div>

                    {/* Selection status bar */}
                    {selected && (
                        <div className={`p-3 border-t flex items-center gap-2 ${selected.type === 'workout' ? 'bg-primary/5' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                            {selected.type === 'workout'
                                ? <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                                : <UtensilsCrossed className="w-4 h-4 text-orange-500 shrink-0" />}
                            <p className="text-xs font-medium truncate flex-1">{selected.item.name}</p>
                            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </aside>

                {/* Right: Curriculum grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold">Course Curriculum</h2>
                            </div>
                            <Button size="sm" onClick={handleAddWeek} disabled={isAddingWeek}>
                                {isAddingWeek ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                                Add Week
                            </Button>
                        </div>

                        {course.weeks.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed rounded-xl">
                                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                <h3 className="font-semibold mb-1">No weeks yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">Start by adding your first week</p>
                                <Button onClick={handleAddWeek} disabled={isAddingWeek}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Week 1
                                </Button>
                            </div>
                        )}

                        {course.weeks.map(week => (
                            <WeekCard
                                key={week.id} week={week} courseId={courseId}
                                selected={selected}
                                onDeleteWeek={handleDeleteWeek}
                                onDeleteSession={handleDeleteSession}
                                onAddSession={handleAddSession}
                                onClearSelection={() => setSelected(null)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
