'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Apple, Flame, Target, Plus, TrendingUp, Utensils, Trash2, Settings, CalendarDays, Check } from "lucide-react"
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
import { NutritionTargetSettings } from '@/components/features/nutrition/NutritionTargetSettings'

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
  schedule: {
    id: string
    name: string
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
  const [targets, setTargets] = useState({
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFats: 65,
  })
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([])
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [deleteScheduledId, setDeleteScheduledId] = useState<string | null>(null)
  const [deletingScheduled, setDeletingScheduled] = useState(false)

  const dailyGoals = {
    calories: { consumed: stats.totalCalories, target: targets.targetCalories },
    protein: { consumed: stats.totalProtein, target: targets.targetProtein },
    carbs: { consumed: stats.totalCarbs, target: targets.targetCarbs },
    fats: { consumed: stats.totalFats, target: targets.targetFats },
  }

  const fetchData = async () => {
    try {
      const [logsRes, statsRes, scheduledRes] = await Promise.all([
        fetch('/api/nutrition-logs'),
        fetch('/api/nutrition-logs/stats'),
        fetch('/api/meal-schedules/today'),
      ])

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats({
          totalCalories: statsData.totalCalories,
          totalProtein: statsData.totalProtein,
          totalCarbs: statsData.totalCarbs,
          totalFats: statsData.totalFats,
        })
        // Set targets from API response
        if (statsData.targets) {
          setTargets(statsData.targets)
        }
      }

      if (scheduledRes.ok) {
        const scheduledData = await scheduledRes.json()
        setScheduledMeals(scheduledData)
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

  const handleComplete = async (mealId: string) => {
    setCompletingId(mealId)
    try {
      const response = await fetch(`/api/scheduled-meals/${mealId}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete')
      }

      toast.success('Meal completed!')
      fetchData() // Refresh both scheduled meals and nutrition logs
    } catch (error: any) {
      console.error('Error completing meal:', error)
      toast.error(error.message || 'Unable to complete meal')
    } finally {
      setCompletingId(null)
    }
  }

  const handleDeleteScheduled = async () => {
    if (!deleteScheduledId) return

    setDeletingScheduled(true)
    try {
      // Find the meal to get its schedule ID
      const meal = scheduledMeals.find(m => m.id === deleteScheduledId)
      if (!meal) {
        throw new Error('Meal not found')
      }

      const response = await fetch(`/api/meal-schedules/${meal.schedule.id}/meals/${deleteScheduledId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      toast.success('Meal removed from schedule')
      fetchData()
    } catch (error) {
      console.error('Error deleting scheduled meal:', error)
      toast.error('Unable to delete meal')
    } finally {
      setDeletingScheduled(false)
      setDeleteScheduledId(null)
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
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-5 h-5 mr-2" />
              Targets
            </Button>
            <Button size="lg" asChild>
              <Link href="/nutrition/log">
                <Plus className="w-5 h-5 mr-2" />
                Log Meal
              </Link>
            </Button>
          </div>
        </div>

        {/* Daily Goals Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Meal Schedule Card */}
          <Card className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Meal Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Plan meals by week, month, or year. Create detailed meal schedules and track progress.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Create meal schedules</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>View calendar format</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Track progress</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" asChild>
                <Link href="/nutrition/schedule">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  View Schedule
                </Link>
              </Button>
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

        {/* Today's Scheduled Meals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Today's Scheduled Meals
              </CardTitle>
              <Badge variant="secondary">
                {scheduledMeals.filter(m => !m.isCompleted).length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {scheduledMeals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meals scheduled for today</p>
                <p className="text-sm mt-2">Visit <Link href="/nutrition/schedule" className="text-primary hover:underline">Meal Schedule</Link> to create a schedule</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledMeals.map((meal) => {
                  const multiplier = meal.quantity / 100
                  const calculatedCals = (meal.food.calories * multiplier).toFixed(0)
                  const calculatedProtein = (meal.food.protein * multiplier).toFixed(1)
                  const calculatedCarbs = (meal.food.carbs * multiplier).toFixed(1)
                  const calculatedFats = (meal.food.fats * multiplier).toFixed(1)

                  return (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-lg border ${meal.isCompleted
                        ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900 opacity-60'
                        : 'bg-card hover:bg-muted/50'
                        } transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Badge: Meal Type + Completed Status */}
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
                            </Badge>
                            {meal.isCompleted && (
                              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>

                          {/* Food Name + From Schedule */}
                          <div className="font-semibold">{meal.food.name}</div>
                          <div className="text-sm text-muted-foreground">
                            From schedule: {meal.schedule.name}
                          </div>

                          {/* Quantity */}
                          <div className="text-sm text-muted-foreground mt-1">
                            {meal.quantity}g
                          </div>

                          {/* Notes */}
                          {meal.notes && (
                            <div className="text-sm text-muted-foreground italic mt-1">
                              {meal.notes}
                            </div>
                          )}

                          {/* Macros */}
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{calculatedCals} cal</span>
                            <span>P: {calculatedProtein}g</span>
                            <span>C: {calculatedCarbs}g</span>
                            <span>F: {calculatedFats}g</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!meal.isCompleted && (
                            <Button
                              onClick={() => handleComplete(meal.id)}
                              disabled={completingId === meal.id}
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              {completingId === meal.id ? 'Processing...' : 'Complete'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteScheduledId(meal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div >

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

      {/* Scheduled Meal Delete Confirmation */}
      <AlertDialog open={!!deleteScheduledId} onOpenChange={(open) => !open && setDeleteScheduledId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Meal from Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this meal from the schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingScheduled}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteScheduled} disabled={deletingScheduled}>
              {deletingScheduled ? 'Deleting...' : 'Delete meal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Nutrition Target Settings Dialog */}
      <NutritionTargetSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentTargets={targets}
        onUpdate={fetchData}
      />
    </>
  )
}
