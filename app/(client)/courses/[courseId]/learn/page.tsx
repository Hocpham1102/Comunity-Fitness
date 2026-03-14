'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    ArrowLeft, ChevronDown, ChevronRight, Dumbbell, Utensils,
    Loader2, Target, CalendarPlus, Clock, Zap, CheckCircle2,
    PlayCircle, Apple, Circle, BookOpen
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Type Definitions ───────────────────────────────────────────────────────

interface MealFood {
    id: string
    mealType: string
    quantity: number
    dayOfCycle: number
    food: { id: string; name: string; calories: number; protein: number; carbs: number; fats: number }
}

interface MealPlanData {
    id: string
    name: string
    description: string | null
    targetCalories: number | null
    targetProtein: number | null
    targetCarbs: number | null
    targetFats: number | null
    cycleDays: number
    meals: MealFood[]
}

interface Session {
    id: string
    dayNumber: number
    title: string | null
    notes: string | null
    workout: {
        id: string; name: string; difficulty: string
        estimatedTime: number | null; _count: { exercises: number }
    } | null
    mealPlan: MealPlanData | null
}

interface Week {
    id: string
    weekNumber: number
    title: string | null
    description: string | null
    sessions: Session[]
}

interface Course {
    id: string
    title: string
    thumbnailUrl: string | null
    weeks: Week[]
    trainer: { name: string | null; image: string | null }
}

/** A "Day" is a group of sessions sharing the same dayNumber within a week */
interface DayGroup {
    dayNumber: number
    sessions: Session[]
    workout: Session['workout'] | null
    mealPlan: Session['mealPlan'] | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MEAL_LABELS: Record<string, string> = {
    BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner',
    SNACK: 'Snack', PRE_WORKOUT: 'Pre-Workout', POST_WORKOUT: 'Post-Workout',
}

const DIFFICULTY_COLOR: Record<string, string> = {
    BEGINNER: 'text-green-600 bg-green-500/10',
    INTERMEDIATE: 'text-yellow-600 bg-yellow-500/10',
    ADVANCED: 'text-red-600 bg-red-500/10',
}

function groupByDay(sessions: Session[]): DayGroup[] {
    const map: Record<number, DayGroup> = {}
    sessions.forEach(s => {
        if (!map[s.dayNumber]) map[s.dayNumber] = { dayNumber: s.dayNumber, sessions: [], workout: null, mealPlan: null }
        map[s.dayNumber].sessions.push(s)
        if (s.workout) map[s.dayNumber].workout = s.workout
        if (s.mealPlan) map[s.dayNumber].mealPlan = s.mealPlan
    })
    return Object.values(map).sort((a, b) => a.dayNumber - b.dayNumber)
}

// ─── FoodsSection ────────────────────────────────────────────────────────────

function FoodsSection({ meals, cycleDays }: { meals: MealFood[]; cycleDays: number }) {
    const grouped: Record<number, Record<string, MealFood[]>> = {}
    meals.forEach(meal => {
        if (!grouped[meal.dayOfCycle]) grouped[meal.dayOfCycle] = {}
        if (!grouped[meal.dayOfCycle][meal.mealType]) grouped[meal.dayOfCycle][meal.mealType] = []
        grouped[meal.dayOfCycle][meal.mealType].push(meal)
    })

    const dayKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b)
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

    const toggle = (day: number) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(day)) next.delete(day); else next.add(day)
            return next
        })
    }

    const FoodRow = ({ meal }: { meal: MealFood }) => {
        const cal = Math.round(meal.food.calories * meal.quantity / 100)
        const p = (meal.food.protein * meal.quantity / 100).toFixed(1)
        const c = (meal.food.carbs * meal.quantity / 100).toFixed(1)
        const f = (meal.food.fats * meal.quantity / 100).toFixed(1)
        return (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                    <Apple className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{meal.food.name}</div>
                    <div className="text-xs text-muted-foreground">{meal.quantity}g</div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-orange-600">{cal} cal</div>
                    <div className="text-xs text-muted-foreground">P{p} C{c} F{f}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {dayKeys.map(day => {
                const types = grouped[day]
                const isOpen = !collapsed.has(day)
                const totalFoods = Object.values(types).flat().length

                return (
                    <div key={day} className="rounded-lg border border-border/60 overflow-hidden">
                        {/* Day header — always visible */}
                        {cycleDays > 1 ? (
                            <button
                                onClick={() => toggle(day)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                            >
                                <ChevronDown className={`w-3.5 h-3.5 text-primary transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                                <span className="text-xs font-bold text-primary flex-1">Day {day}</span>
                                <span className="text-xs text-muted-foreground">{totalFoods} foods</span>
                            </button>
                        ) : null}

                        {/* Meal type sections */}
                        {(cycleDays === 1 || isOpen) && (
                            <div className={`space-y-3 ${cycleDays > 1 ? 'p-3' : ''}`}>
                                {Object.entries(types).map(([type, typeMeals]) => (
                                    <div key={type}>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">
                                            {MEAL_LABELS[type] ?? type}
                                        </div>
                                        <div className="space-y-2">
                                            {typeMeals.map(meal => <FoodRow key={meal.id} meal={meal} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CourseLearnPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
    const [selectedDay, setSelectedDay] = useState<DayGroup | null>(null)
    const [applyingPlan, setApplyingPlan] = useState(false)
    const [addingToSchedule, setAddingToSchedule] = useState(false)
    const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0])

    const applyMealPlanTargets = async (mealPlan: MealPlanData) => {
        let targetCalories = mealPlan.targetCalories
        let targetProtein = mealPlan.targetProtein ?? 0
        let targetCarbs = mealPlan.targetCarbs ?? 0
        let targetFats = mealPlan.targetFats ?? 0

        if (!targetCalories && mealPlan.meals.length > 0) {
            const totals = mealPlan.meals.reduce(
                (acc, meal) => {
                    const m = meal.quantity / 100
                    return { calories: acc.calories + meal.food.calories * m, protein: acc.protein + meal.food.protein * m, carbs: acc.carbs + meal.food.carbs * m, fats: acc.fats + meal.food.fats * m }
                },
                { calories: 0, protein: 0, carbs: 0, fats: 0 }
            )
            targetCalories = Math.round(totals.calories)
            targetProtein = Math.round(totals.protein)
            targetCarbs = Math.round(totals.carbs)
            targetFats = Math.round(totals.fats)
        }
        if (!targetCalories) { toast.error('Meal plan has no foods or targets to apply'); return }

        setApplyingPlan(true)
        try {
            const res = await fetch('/api/nutrition-targets', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetCalories, targetProtein, targetCarbs, targetFats, useCustomTargets: true }),
            })
            if (res.ok) toast.success('Nutrition targets updated! 🎯', { description: `${targetCalories} kcal · P ${targetProtein}g · C ${targetCarbs}g · F ${targetFats}g` })
            else toast.error('Failed to apply targets')
        } catch { toast.error('Something went wrong') }
        finally { setApplyingPlan(false) }
    }

    const addToSchedule = async (mealPlan: MealPlanData) => {
        if (mealPlan.meals.length === 0) { toast.error('Meal plan has no foods to add to schedule'); return }
        setAddingToSchedule(true)
        try {
            const res = await fetch(`/api/courses/${courseId}/add-meal-plan`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mealPlanId: mealPlan.id, scheduledDate: scheduleDate }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(`Added ${data.addedMeals} meals to your schedule! 📅`, {
                    description: `Starting ${new Date(scheduleDate).toLocaleDateString()}`,
                    action: { label: 'View Schedule', onClick: () => router.push('/nutrition/schedule') },
                })
            } else { toast.error(data.error ?? 'Failed to add to schedule') }
        } catch { toast.error('Something went wrong') }
        finally { setAddingToSchedule(false) }
    }

    const fetchCourse = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/courses/${courseId}/learn`)
            if (res.status === 401 || res.status === 403) { router.push(`/courses/${courseId}`); return }
            if (res.ok) {
                const data = await res.json()
                setCourse(data)
                if (data.weeks?.length > 0) {
                    setExpandedWeeks(new Set([data.weeks[0].id]))
                    const firstWeekDays = groupByDay(data.weeks[0].sessions)
                    if (firstWeekDays.length > 0) setSelectedDay(firstWeekDays[0])
                }
            }
        } catch (err) { console.error('Error fetching course:', err) }
        finally { setLoading(false) }
    }, [courseId, router])

    useEffect(() => { if (courseId) fetchCourse() }, [courseId, fetchCourse])

    const toggleWeek = (weekId: string) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev)
            if (next.has(weekId)) next.delete(weekId); else next.add(weekId)
            return next
        })
    }

    const totalSessions = course?.weeks.reduce((a, w) => a + w.sessions.length, 0) ?? 0

    if (loading) return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading course content...</p>
            </div>
        </div>
    )

    if (!course) return (
        <div className="text-center py-16">
            <p className="text-muted-foreground">Course not found or you need to enroll first.</p>
            <Link href="/courses"><Button className="mt-4">Browse Courses</Button></Link>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto">
            {/* ── Course Header ─────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/10 border p-5 md:p-6">
                <div className="absolute top-0 right-0 w-60 h-60 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="flex items-start gap-4">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold truncate">{course.title}</h1>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={course.trainer.image || undefined} />
                                    <AvatarFallback className="text-xs">{course.trainer.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">{course.trainer.name ?? 'Trainer'}</span>
                            </div>
                            <span className="text-muted-foreground/40 text-xs">·</span>
                            <span className="text-sm text-muted-foreground">{course.weeks.length} weeks · {totalSessions} sessions</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Sidebar ─────────────────────────────── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 rounded-xl border bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> Course Content
                            </h2>
                        </div>
                        <div className="max-h-[65vh] overflow-y-auto">
                            {course.weeks.map((week) => {
                                const days = groupByDay(week.sessions)
                                return (
                                    <div key={week.id} className="border-b last:border-b-0">
                                        {/* Week header */}
                                        <button
                                            onClick={() => toggleWeek(week.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                                {week.weekNumber}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold truncate">
                                                    Week {week.weekNumber}{week.title ? ` · ${week.title}` : ''}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{days.length} days</div>
                                            </div>
                                            {expandedWeeks.has(week.id)
                                                ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                                                : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                            }
                                        </button>

                                        {/* Days under week */}
                                        {expandedWeeks.has(week.id) && (
                                            <div className="bg-muted/20">
                                                {days.length === 0 ? (
                                                    <div className="px-4 py-3 text-xs text-muted-foreground italic border-t border-border/50">
                                                        No sessions in this week yet
                                                    </div>
                                                ) : days.map((day) => {
                                                    const isSelected = selectedDay?.dayNumber === day.dayNumber &&
                                                        selectedDay?.sessions[0]?.id === day.sessions[0]?.id
                                                    return (
                                                        <button
                                                            key={day.dayNumber}
                                                            onClick={() => setSelectedDay(day)}
                                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-t border-border/50 ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/50'}`}
                                                        >
                                                            {/* Day circle */}
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/70 text-muted-foreground'}`}>
                                                                {day.dayNumber}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-xs font-semibold ${isSelected ? 'text-primary' : ''}`}>
                                                                    Day {day.dayNumber}
                                                                </div>
                                                                {/* Content type pills */}
                                                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                                                    {day.workout && (
                                                                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                                                            <Dumbbell className="w-2.5 h-2.5" /> Workout
                                                                        </span>
                                                                    )}
                                                                    {day.mealPlan && (
                                                                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                                                                            <Utensils className="w-2.5 h-2.5" /> Meal Plan
                                                                        </span>
                                                                    )}
                                                                    {!day.workout && !day.mealPlan && (
                                                                        <span className="text-[10px] text-muted-foreground italic">Rest day</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isSelected && <PlayCircle className="w-4 h-4 text-primary shrink-0" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Main Content ────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">
                    {selectedDay ? (
                        <>
                            {/* Day header */}
                            <div className="rounded-xl border bg-card p-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">Day {selectedDay.dayNumber}</Badge>
                                    {selectedDay.workout && (
                                        <Badge variant="outline" className="text-xs gap-1">
                                            <Dumbbell className="w-3 h-3" />Workout
                                        </Badge>
                                    )}
                                    {selectedDay.mealPlan && (
                                        <Badge variant="outline" className="text-xs gap-1 text-green-700 border-green-500/30">
                                            <Utensils className="w-3 h-3" />Meal Plan
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold mt-1">Day {selectedDay.dayNumber}</h2>
                                {selectedDay.sessions[0]?.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{selectedDay.sessions[0].notes}</p>
                                )}
                            </div>

                            {/* Workout card */}
                            {selectedDay.workout && (
                                <div className="rounded-xl border bg-card overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary/15 to-primary/5 px-5 py-4 flex items-center justify-between border-b">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                <Dumbbell className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-semibold">Today's Workout</span>
                                        </div>
                                        <Link href={`/workouts/${selectedDay.workout.id}`}>
                                            <Button size="sm" className="gap-2">
                                                <PlayCircle className="w-4 h-4" /> Start Workout
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="px-5 py-4">
                                        <h3 className="font-semibold text-lg">{selectedDay.workout.name}</h3>
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[selectedDay.workout.difficulty] ?? 'bg-muted text-muted-foreground'}`}>
                                                <Zap className="w-3 h-3" />{selectedDay.workout.difficulty}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CheckCircle2 className="w-3.5 h-3.5" />{selectedDay.workout._count.exercises} exercises
                                            </span>
                                            {selectedDay.workout.estimatedTime && (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />{selectedDay.workout.estimatedTime} min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Meal Plan card */}
                            {selectedDay.mealPlan && (
                                <div className="rounded-xl border bg-card overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 px-5 py-4 flex items-center justify-between border-b">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                <Utensils className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span className="font-semibold">Meal Plan</span>
                                        </div>
                                        <Button
                                            size="sm" variant="outline"
                                            className="gap-2 border-primary/30 hover:bg-primary/10"
                                            onClick={() => applyMealPlanTargets(selectedDay.mealPlan!)}
                                            disabled={applyingPlan}
                                        >
                                            {applyingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                                            Apply Targets
                                        </Button>
                                    </div>

                                    <div className="px-5 py-4 space-y-5">
                                        <div>
                                            <h3 className="font-semibold text-base">{selectedDay.mealPlan.name}</h3>
                                            {selectedDay.mealPlan.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{selectedDay.mealPlan.description}</p>
                                            )}
                                        </div>

                                        {/* Macro targets */}
                                        {selectedDay.mealPlan.targetCalories && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { label: 'Calories', value: selectedDay.mealPlan.targetCalories, unit: 'kcal', bg: 'bg-orange-500/10', text: 'text-orange-600' },
                                                    { label: 'Protein', value: selectedDay.mealPlan.targetProtein, unit: 'g', bg: 'bg-blue-500/10', text: 'text-blue-600' },
                                                    { label: 'Carbs', value: selectedDay.mealPlan.targetCarbs, unit: 'g', bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
                                                    { label: 'Fats', value: selectedDay.mealPlan.targetFats, unit: 'g', bg: 'bg-pink-500/10', text: 'text-pink-600' },
                                                ].map(item => item.value != null && (
                                                    <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                                                        <div className={`text-lg font-bold ${item.text}`}>{Math.round(item.value)}</div>
                                                        <div className="text-xs text-muted-foreground">{item.unit}</div>
                                                        <div className="text-xs font-medium mt-0.5">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Foods list */}
                                        {selectedDay.mealPlan.meals.length > 0 ? (
                                            <div>
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                    <Apple className="w-3.5 h-3.5" /> Foods in this plan
                                                </h4>
                                                <FoodsSection
                                                    meals={selectedDay.mealPlan.meals}
                                                    cycleDays={selectedDay.mealPlan.cycleDays}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No foods added to this meal plan yet.</p>
                                        )}

                                        {/* Add to schedule */}
                                        <div className="border-t pt-4">
                                            <div className="text-xs text-muted-foreground mb-3">
                                                Add this plan to your nutrition schedule:
                                            </div>
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-1">
                                                    <label className="text-xs text-muted-foreground block mb-1">Start date</label>
                                                    <input
                                                        type="date"
                                                        value={scheduleDate}
                                                        onChange={(e) => setScheduleDate(e.target.value)}
                                                        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="gap-2 h-9 border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
                                                    onClick={() => addToSchedule(selectedDay.mealPlan!)}
                                                    disabled={addingToSchedule}
                                                >
                                                    {addingToSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                                                    Add to My Schedule
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No content */}
                            {!selectedDay.workout && !selectedDay.mealPlan && (
                                <div className="rounded-xl border bg-muted/20 py-16 text-center">
                                    <Circle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                                    <p className="text-muted-foreground">Rest day — no workout or meal plan assigned.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-xl border bg-muted/20 flex flex-col items-center justify-center h-64 gap-3">
                            <PlayCircle className="w-12 h-12 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Select a day from the curriculum to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
