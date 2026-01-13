'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Apple, Flame, Target, Plus, TrendingUp, Utensils, Trash2 } from "lucide-react"
import Link from "next/link"
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

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
  PRE_WORKOUT: 'Pre-Workout',
  POST_WORKOUT: 'Post-Workout',
}

export default function NutritionPage() {
  const [logs, setLogs] = useState<NutritionLog[]>([])
  const [stats, setStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  })
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const dailyGoals = {
    calories: { consumed: stats.totalCalories, target: 2200 },
    protein: { consumed: stats.totalProtein, target: 180 },
    carbs: { consumed: stats.totalCarbs, target: 220 },
    fats: { consumed: stats.totalFats, target: 75 },
  }

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch('/api/nutrition-logs'),
        fetch('/api/nutrition-logs/stats'),
      ])

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
      fetchData()
    } catch (error) {
      console.error('Error deleting log:', error)
      toast.error('Failed to delete meal')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  // Group meals by type
  const groupedMeals = logs.reduce((acc, log) => {
    const type = log.mealType
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(log)
    return acc
  }, {} as Record<string, NutritionLog[]>)

  // Convert to array format for display
  const todaysMeals = Object.entries(groupedMeals).flatMap(([type, meals]) =>
    meals.map(meal => ({
      id: meal.id,
      type: MEAL_TYPE_LABELS[type] || type,
      time: new Date(meal.consumedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      name: meal.food.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      quantity: meal.quantity,
    }))
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
            <p className="text-muted-foreground">Track your meals and hit your macro goals</p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
            <p className="text-muted-foreground">Track your meals and hit your macro goals</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/nutrition/log">
              <Plus className="w-5 h-5 mr-2" />
              Log Meal
            </Link>
          </Button>
        </div>

        {/* Daily Goals Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Daily Macros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.calories.consumed.toFixed(0)} / {dailyGoals.calories.target} cal
                  </span>
                </div>
                <Progress value={(dailyGoals.calories.consumed / dailyGoals.calories.target) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.protein.consumed.toFixed(0)}g / {dailyGoals.protein.target}g
                  </span>
                </div>
                <Progress value={(dailyGoals.protein.consumed / dailyGoals.protein.target) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.carbs.consumed.toFixed(0)}g / {dailyGoals.carbs.target}g
                  </span>
                </div>
                <Progress value={(dailyGoals.carbs.consumed / dailyGoals.carbs.target) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fats</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.fats.consumed.toFixed(0)}g / {dailyGoals.fats.target}g
                  </span>
                </div>
                <Progress value={(dailyGoals.fats.consumed / dailyGoals.fats.target) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Macro Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Protein</div>
                    <div className="text-2xl font-bold text-primary">{dailyGoals.protein.consumed.toFixed(0)}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-lg font-semibold">{dailyGoals.protein.target}g</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Carbs</div>
                    <div className="text-2xl font-bold text-secondary">{dailyGoals.carbs.consumed.toFixed(0)}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-lg font-semibold">{dailyGoals.carbs.target}g</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Fats</div>
                    <div className="text-2xl font-bold text-accent">{dailyGoals.fats.consumed.toFixed(0)}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-lg font-semibold">{dailyGoals.fats.target}g</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-secondary" />
                Today's Meals
              </CardTitle>
              <Badge variant="secondary">{todaysMeals.length} meals logged</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todaysMeals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meals logged today</p>
                <p className="text-sm mt-2">Click "Log Meal" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysMeals.map((meal) => (
                  <div key={meal.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {meal.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{meal.time}</span>
                        </div>
                        <div className="font-semibold">{meal.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{meal.quantity}g</div>
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{meal.calories.toFixed(0)} cal</span>
                      <span>P: {meal.protein.toFixed(1)}g</span>
                      <span>C: {meal.carbs.toFixed(1)}g</span>
                      <span>F: {meal.fats.toFixed(1)}g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
