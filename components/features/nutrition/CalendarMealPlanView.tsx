'use client'

import { MealType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export interface MealInPlan {
    id?: string
    foodId: string
    foodName: string
    mealType: MealType
    quantity: number
    dayOfCycle: number
    order?: number
    calories: number
    protein: number
    carbs: number
    fats: number
}

interface CalendarMealPlanViewProps {
    cycleDays: number
    meals: MealInPlan[]
    onAddMeal: (dayOfCycle: number, mealType: MealType) => void
    onRemoveMeal: (mealId: string, dayOfCycle: number, mealType: MealType) => void
}

const MEAL_TYPES: { type: MealType; label: string; icon: string; color: string }[] = [
    { type: 'BREAKFAST', label: 'Sáng', icon: '🌅', color: 'bg-orange-100 text-orange-700' },
    { type: 'LUNCH', label: 'Trưa', icon: '☀️', color: 'bg-yellow-100 text-yellow-700' },
    { type: 'DINNER', label: 'Tối', icon: '🌙', color: 'bg-blue-100 text-blue-700' },
    { type: 'SNACK', label: 'Phụ', icon: '🍎', color: 'bg-green-100 text-green-700' },
]

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function CalendarMealPlanView({
    cycleDays,
    meals,
    onAddMeal,
    onRemoveMeal,
}: CalendarMealPlanViewProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null)

    // Group meals by day
    const mealsByDay = new Map<number, MealInPlan[]>()
    for (const meal of meals) {
        if (!mealsByDay.has(meal.dayOfCycle)) {
            mealsByDay.set(meal.dayOfCycle, [])
        }
        mealsByDay.get(meal.dayOfCycle)!.push(meal)
    }

    // Calculate nutrition for a day
    const getDayNutrition = (dayOfCycle: number) => {
        const dayMeals = mealsByDay.get(dayOfCycle) || []
        let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 }
        for (const meal of dayMeals) {
            const multiplier = meal.quantity / 100
            totals.calories += meal.calories * multiplier
            totals.protein += meal.protein * multiplier
            totals.carbs += meal.carbs * multiplier
            totals.fats += meal.fats * multiplier
        }
        return totals
    }

    // Get meals for selected day grouped by meal type
    const selectedDayMeals = selectedDay ? mealsByDay.get(selectedDay) || [] : []
    const mealsByType = new Map<MealType, MealInPlan[]>()
    for (const meal of selectedDayMeals) {
        if (!mealsByType.has(meal.mealType)) {
            mealsByType.set(meal.mealType, [])
        }
        mealsByType.get(meal.mealType)!.push(meal)
    }

    // Generate calendar grid (7 columns for days)
    const weeks: number[][] = []
    let currentWeek: number[] = []

    for (let day = 1; day <= cycleDays; day++) {
        currentWeek.push(day)
        if (currentWeek.length === 7) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    }
    if (currentWeek.length > 0) {
        // Fill remaining days with 0 (empty cells)
        while (currentWeek.length < 7) {
            currentWeek.push(0)
        }
        weeks.push(currentWeek)
    }

    return (
        <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-muted">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="p-2 text-center font-semibold text-sm border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 border-t">
                        {week.map((day, dayIdx) => {
                            if (day === 0) {
                                return <div key={dayIdx} className="border-r last:border-r-0 bg-muted/30 min-h-[100px]" />
                            }

                            const dayMeals = mealsByDay.get(day) || []
                            const nutrition = getDayNutrition(day)
                            const isSelected = selectedDay === day

                            return (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`
                                        border-r last:border-r-0 p-2 min-h-[100px] text-left
                                        hover:bg-accent/50 transition-colors
                                        ${isSelected ? 'bg-primary/10 border-2 border-primary' : ''}
                                    `}
                                >
                                    <div className="font-bold text-lg mb-1">{day}</div>
                                    {dayMeals.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="text-xs font-semibold text-primary">
                                                {Math.round(nutrition.calories)} kcal
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {MEAL_TYPES.map(({ type, icon }) => {
                                                    const hasMeal = dayMeals.some(m => m.mealType === type)
                                                    return hasMeal ? (
                                                        <span key={type} className="text-sm">{icon}</span>
                                                    ) : null
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {dayMeals.length === 0 && (
                                        <div className="text-xs text-muted-foreground">Chưa có meal</div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Selected Day Details Dialog */}
            <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ngày {selectedDay} - Meals</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Nutrition Summary */}
                        {selectedDay && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Calories</div>
                                            <div className="text-lg font-bold">{Math.round(getDayNutrition(selectedDay).calories)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Protein</div>
                                            <div className="text-lg font-bold">{Math.round(getDayNutrition(selectedDay).protein)}g</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Carbs</div>
                                            <div className="text-lg font-bold">{Math.round(getDayNutrition(selectedDay).carbs)}g</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Fats</div>
                                            <div className="text-lg font-bold">{Math.round(getDayNutrition(selectedDay).fats)}g</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Meals by Type */}
                        {MEAL_TYPES.map((mealTypeInfo) => {
                            const mealsOfType = mealsByType.get(mealTypeInfo.type) || []

                            return (
                                <Card key={mealTypeInfo.type}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{mealTypeInfo.icon}</span>
                                                <CardTitle className="text-lg">{mealTypeInfo.label}</CardTitle>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => selectedDay && onAddMeal(selectedDay, mealTypeInfo.type)}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Thêm món
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {mealsOfType.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Chưa có món ăn</p>
                                        ) : (
                                            mealsOfType.map((meal) => (
                                                <div
                                                    key={meal.id || `${meal.foodId}-${meal.mealType}`}
                                                    className="flex items-start justify-between p-3 bg-muted rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium">{meal.foodName}</div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {meal.quantity}g • {Math.round(meal.calories * meal.quantity / 100)} kcal
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => selectedDay && onRemoveMeal(meal.id || '', selectedDay, mealTypeInfo.type)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
