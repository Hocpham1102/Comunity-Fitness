'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, Calendar as CalendarIcon } from "lucide-react"
import { toast } from 'sonner'
import { MealAssignmentDialog } from '@/components/features/nutrition/MealAssignmentDialog'
import { DailyMealSchedule } from '@/components/features/nutrition/DailyMealSchedule'

interface ScheduledMeal {
    id: string
    foodId: string
    mealType: string
    scheduledDate: string
    quantity: number
    notes?: string
    isCompleted: boolean
    food: {
        id: string
        name: string
        calories: number
        protein: number
        carbs: number
        fats: number
    }
}

interface MealSchedule {
    id: string
    name: string
    description?: string
    scheduleType: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    startDate: string
    endDate?: string
    isActive: boolean
    scheduledMeals: ScheduledMeal[]
}

const MEAL_TYPE_COLORS: Record<string, string> = {
    BREAKFAST: 'bg-orange-500',
    LUNCH: 'bg-green-500',
    DINNER: 'bg-blue-500',
    SNACK: 'bg-purple-500',
    PRE_WORKOUT: 'bg-red-500',
    POST_WORKOUT: 'bg-pink-500',
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ScheduleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const scheduleId = params.id as string

    const [schedule, setSchedule] = useState<MealSchedule | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)

    const fetchSchedule = async () => {
        try {
            const response = await fetch(`/api/meal-schedules/${scheduleId}`)
            if (response.ok) {
                const data = await response.json()
                setSchedule(data)
            } else {
                toast.error('Unable to load schedule')
                router.push('/nutrition/schedule')
            }
        } catch (error) {
            console.error('Error fetching schedule:', error)
            toast.error('Error loading schedule')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedule()
    }, [scheduleId])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: (Date | null)[] = []

        // Add empty cells for days before the first day of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const getMealsForDate = (date: Date): ScheduledMeal[] => {
        if (!schedule) return []

        const dateStr = date.toISOString().split('T')[0]
        return schedule.scheduledMeals.filter(meal => {
            const mealDate = new Date(meal.scheduledDate).toISOString().split('T')[0]
            return mealDate === dateStr
        })
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const handleDayClick = (date: Date) => {
        setSelectedDate(date)
    }

    const handleAddMeal = (date: Date) => {
        setSelectedDate(date)
        setAssignmentDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/nutrition/schedule')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">Loading...</h1>
                </div>
            </div>
        )
    }

    if (!schedule) {
        return null
    }

    const days = getDaysInMonth(currentDate)

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push('/nutrition/schedule')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{schedule.name}</h1>
                            {schedule.description && (
                                <p className="text-muted-foreground">{schedule.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" />
                                Meal Schedule
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="font-semibold min-w-[150px] text-center">
                                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Day headers */}
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="text-center font-semibold text-sm py-2">
                                    {day}
                                </div>
                            ))}

                            {/* Day cells */}
                            {days.map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="aspect-square" />
                                }

                                const meals = getMealsForDate(day)
                                const isToday = day.toDateString() === new Date().toDateString()
                                const isSelected = selectedDate?.toDateString() === day.toDateString()

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleDayClick(day)}
                                        className={`
                      aspect-square p-2 rounded-lg border-2 transition-all
                      hover:border-primary hover:shadow-md
                      ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                    `}
                                    >
                                        <div className="h-full flex flex-col">
                                            <span className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                                                {day.getDate()}
                                            </span>
                                            {meals.length > 0 && (
                                                <div className="flex-1 flex flex-wrap gap-1 mt-1">
                                                    {meals.slice(0, 3).map(meal => (
                                                        <div
                                                            key={meal.id}
                                                            className={`w-1.5 h-1.5 rounded-full ${MEAL_TYPE_COLORS[meal.mealType] || 'bg-gray-500'}`}
                                                            title={meal.food.name}
                                                        />
                                                    ))}
                                                    {meals.length > 3 && (
                                                        <span className="text-xs text-muted-foreground">+{meals.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-semibold mb-2">Legend:</p>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className="text-xs">Breakfast</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-xs">Lunch</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs">Dinner</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                                    <span className="text-xs">Snack</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Daily Schedule - shown when a date is selected */}
                {selectedDate && (
                    <DailyMealSchedule
                        date={selectedDate}
                        meals={getMealsForDate(selectedDate)}
                        onAddMeal={() => handleAddMeal(selectedDate)}
                        onRefresh={fetchSchedule}
                        scheduleId={scheduleId}
                    />
                )}
            </div>

            {/* Meal Assignment Dialog */}
            <MealAssignmentDialog
                open={assignmentDialogOpen}
                onOpenChange={setAssignmentDialogOpen}
                scheduleId={scheduleId}
                selectedDate={selectedDate}
                onSuccess={() => {
                    fetchSchedule()
                    setAssignmentDialogOpen(false)
                }}
            />
        </>
    )
}
