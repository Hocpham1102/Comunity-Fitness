'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Clock, Utensils } from "lucide-react"
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

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

interface DailyMealScheduleProps {
    date: Date
    meals: ScheduledMeal[]
    onAddMeal: () => void
    onRefresh: () => void
    scheduleId: string
}

const MEAL_TYPE_LABELS: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    SNACK: 'Snack',
    PRE_WORKOUT: 'Pre-Workout',
    POST_WORKOUT: 'Post-Workout',
}

const MEAL_TYPE_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT']

export function DailyMealSchedule({ date, meals, onAddMeal, onRefresh, scheduleId }: DailyMealScheduleProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteId) return

        setDeleting(true)
        try {
            const response = await fetch(`/api/meal-schedules/${scheduleId}/meals/${deleteId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete')
            }

            toast.success('Meal deleted')
            onRefresh()
        } catch (error) {
            console.error('Error deleting meal:', error)
            toast.error('Unable to delete meal')
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    // Group meals by type
    const mealsByType = meals.reduce((acc, meal) => {
        if (!acc[meal.mealType]) {
            acc[meal.mealType] = []
        }
        acc[meal.mealType].push(meal)
        return acc
    }, {} as Record<string, ScheduledMeal[]>)

    // Sort meal types by predefined order
    const sortedMealTypes = Object.keys(mealsByType).sort((a, b) => {
        return MEAL_TYPE_ORDER.indexOf(a) - MEAL_TYPE_ORDER.indexOf(b)
    })

    const totalCalories = meals.reduce((sum, meal) => sum + (meal.food.calories * meal.quantity / 100), 0)
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.food.protein * meal.quantity / 100), 0)
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.food.carbs * meal.quantity / 100), 0)
    const totalFats = meals.reduce((sum, meal) => sum + (meal.food.fats * meal.quantity / 100), 0)

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Schedule - {date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </CardTitle>
                        <Button onClick={onAddMeal}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Meal
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {meals.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No meals scheduled for this day</p>
                            <p className="text-sm mt-2">Click "Add Meal" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Meal Schedule by Type */}
                            {sortedMealTypes.map(mealType => (
                                <div key={mealType} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-sm font-semibold">
                                            {MEAL_TYPE_LABELS[mealType] || mealType}
                                        </Badge>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    <div className="space-y-2">
                                        {mealsByType[mealType].map(meal => (
                                            <div
                                                key={meal.id}
                                                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-lg">{meal.food.name}</div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Quantity: {meal.quantity}g
                                                        </div>
                                                        {meal.notes && (
                                                            <div className="text-sm text-muted-foreground mt-1 italic">
                                                                Notes: {meal.notes}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-4 mt-3 text-sm">
                                                            <span className="text-orange-600 font-medium">
                                                                {(meal.food.calories * meal.quantity / 100).toFixed(0)} cal
                                                            </span>
                                                            <span className="text-blue-600">
                                                                P: {(meal.food.protein * meal.quantity / 100).toFixed(1)}g
                                                            </span>
                                                            <span className="text-green-600">
                                                                C: {(meal.food.carbs * meal.quantity / 100).toFixed(1)}g
                                                            </span>
                                                            <span className="text-purple-600">
                                                                F: {(meal.food.fats * meal.quantity / 100).toFixed(1)}g
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteId(meal.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Daily Summary */}
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3">Daily Nutrition Total</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                                        <div className="text-sm text-muted-foreground">Calories</div>
                                        <div className="text-2xl font-bold text-orange-600">{totalCalories.toFixed(0)}</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                                        <div className="text-sm text-muted-foreground">Protein</div>
                                        <div className="text-2xl font-bold text-blue-600">{totalProtein.toFixed(1)}g</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                                        <div className="text-sm text-muted-foreground">Carbs</div>
                                        <div className="text-2xl font-bold text-green-600">{totalCarbs.toFixed(1)}g</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                                        <div className="text-sm text-muted-foreground">Fats</div>
                                        <div className="text-2xl font-bold text-purple-600">{totalFats.toFixed(1)}g</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this meal from the schedule? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
