'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2 } from 'lucide-react'
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

interface NutritionLog {
    id: string
    mealType: string
    quantity: number
    calories: number
    protein: number
    carbs: number
    fats: number
    notes?: string
    consumedAt: string
    food: {
        id: string
        name: string
        description?: string
    }
}

interface NutritionHistoryProps {
    logs: NutritionLog[]
    onUpdate?: () => void
}

const MEAL_TYPE_LABELS: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    SNACK: 'Snack',
    PRE_WORKOUT: 'Pre-Workout',
    POST_WORKOUT: 'Post-Workout',
}

export function NutritionHistory({ logs, onUpdate }: NutritionHistoryProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const groupedLogs = logs.reduce((acc, log) => {
        const type = log.mealType
        if (!acc[type]) {
            acc[type] = []
        }
        acc[type].push(log)
        return acc
    }, {} as Record<string, NutritionLog[]>)

    const handleDelete = async () => {
        if (!deleteId) return

        setDeleting(true)
        try {
            const response = await fetch(`/api/nutrition-logs/${deleteId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete')
            }

            toast.success('Meal deleted successfully')
            onUpdate?.()
        } catch (error) {
            console.error('Error deleting log:', error)
            toast.error('Failed to delete meal')
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    const calculateMealTotal = (meals: NutritionLog[]) => {
        return meals.reduce(
            (acc, meal) => ({
                calories: acc.calories + meal.calories,
                protein: acc.protein + meal.protein,
                carbs: acc.carbs + meal.carbs,
                fats: acc.fats + meal.fats,
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        )
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No meals logged today</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {Object.entries(groupedLogs).map(([mealType, meals]) => {
                    const total = calculateMealTotal(meals)
                    return (
                        <Card key={mealType}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{MEAL_TYPE_LABELS[mealType]}</CardTitle>
                                    <Badge variant="secondary">
                                        {total.calories.toFixed(0)} kcal
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {meals.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex justify-between items-start p-3 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-medium">{log.food.name}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {log.quantity}g
                                            </p>
                                            {log.notes && (
                                                <p className="text-sm text-muted-foreground mt-1 italic">
                                                    {log.notes}
                                                </p>
                                            )}
                                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                                <span>{log.calories.toFixed(0)} kcal</span>
                                                <span>P: {log.protein.toFixed(1)}g</span>
                                                <span>C: {log.carbs.toFixed(1)}g</span>
                                                <span>F: {log.fats.toFixed(1)}g</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteId(log.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}

                                {meals.length > 1 && (
                                    <div className="pt-2 border-t flex justify-between text-sm font-medium">
                                        <span>Total</span>
                                        <div className="flex gap-3">
                                            <span>{total.calories.toFixed(0)} kcal</span>
                                            <span>P: {total.protein.toFixed(1)}g</span>
                                            <span>C: {total.carbs.toFixed(1)}g</span>
                                            <span>F: {total.fats.toFixed(1)}g</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this meal? This action cannot be undone.
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
