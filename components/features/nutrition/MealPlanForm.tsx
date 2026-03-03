'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuickMealInput } from './QuickMealInput'
import { CalendarMealPlanView, type MealInPlan } from './CalendarMealPlanView'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, X, TrendingUp, Flame, Apple, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { MealType } from '@prisma/client'

interface Food {
    id: string
    name: string
    description?: string
    calories: number
    protein: number
    carbs: number
    fats: number
    servingSize?: number
    servingUnit?: string
}

interface MealPlanMeal {
    id?: string
    food: Food
    mealType: MealType
    quantity: number
    dayOfCycle: number // NEW: which day in the cycle (1-7, 1-30, etc)
    order: number
}

interface MealPlanFormProps {
    initialData?: {
        id?: string
        name: string
        description?: string
        targetCalories?: number
        targetProtein?: number
        targetCarbs?: number
        targetFats?: number
        cycleDays?: number
        meals?: MealPlanMeal[]
    }
    onSubmit: (data: any) => Promise<void>
    isEditing?: boolean
}

const MEAL_TYPES = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
    { value: 'LUNCH', label: 'Lunch', icon: '☀️' },
    { value: 'DINNER', label: 'Dinner', icon: '🌙' },
    { value: 'SNACK', label: 'Snack', icon: '🍎' },
    { value: 'PRE_WORKOUT', label: 'Pre-Workout', icon: '💪' },
    { value: 'POST_WORKOUT', label: 'Post-Workout', icon: '✨' },
]

export function MealPlanForm({ initialData, onSubmit, isEditing = false }: MealPlanFormProps) {
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [targetCalories, setTargetCalories] = useState(initialData?.targetCalories?.toString() || '')
    const [targetProtein, setTargetProtein] = useState(initialData?.targetProtein?.toString() || '')
    const [targetCarbs, setTargetCarbs] = useState(initialData?.targetCarbs?.toString() || '')
    const [targetFats, setTargetFats] = useState(initialData?.targetFats?.toString() || '')
    const [cycleDays, setCycleDays] = useState(initialData?.cycleDays || 7)
    const [meals, setMeals] = useState<MealPlanMeal[]>(initialData?.meals || [])
    const [selectedMealType, setSelectedMealType] = useState<MealType>('BREAKFAST')
    const [selectedDayOfCycle, setSelectedDayOfCycle] = useState(1)
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)
    const [quantity, setQuantity] = useState('100')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dialog state for adding meals from calendar
    const [addMealDialogOpen, setAddMealDialogOpen] = useState(false)
    const [tempDayOfCycle, setTempDayOfCycle] = useState(1)
    const [tempMealType, setTempMealType] = useState<MealType>('BREAKFAST')

    const calculateTotals = () => {
        return meals.reduce(
            (acc, meal) => {
                // Calculate nutrition based on quantity (in grams)
                // Food nutrition values are per 100g, so multiply by (quantity / 100)
                const multiplier = meal.quantity / 100
                return {
                    calories: acc.calories + meal.food.calories * multiplier,
                    protein: acc.protein + meal.food.protein * multiplier,
                    carbs: acc.carbs + meal.food.carbs * multiplier,
                    fats: acc.fats + meal.food.fats * multiplier,
                }
            },
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        )
    }

    const totals = calculateTotals()

    // Convert meals to MealInPlan format for calendar
    const mealsForCalendar: MealInPlan[] = meals.map((meal) => ({
        id: meal.id,
        foodId: meal.food.id,
        foodName: meal.food.name,
        mealType: meal.mealType,
        quantity: meal.quantity,
        dayOfCycle: meal.dayOfCycle,
        order: meal.order,
        calories: meal.food.calories,
        protein: meal.food.protein,
        carbs: meal.food.carbs,
        fats: meal.food.fats,
    }))

    const handleAddMeal = () => {
        if (!selectedFood) {
            toast.error('Please select a food item')
            return
        }

        const qty = parseFloat(quantity)
        if (isNaN(qty) || qty <= 0) {
            toast.error('Please enter a valid quantity')
            return
        }

        const newMeal: MealPlanMeal = {
            food: selectedFood,
            mealType: selectedMealType,
            quantity: qty,
            dayOfCycle: selectedDayOfCycle,
            order: meals.length + 1,
        }

        setMeals([...meals, newMeal])
        setSelectedFood(null)
        setQuantity('100')
        toast.success('Meal added')
    }

    const handleRemoveMeal = (index: number) => {
        const updatedMeals = meals.filter((_, i) => i !== index)
        // Reorder remaining meals
        const reorderedMeals = updatedMeals.map((meal, i) => ({ ...meal, order: i + 1 }))
        setMeals(reorderedMeals)
        toast.success('Meal removed')
    }

    // Handlers for calendar view
    const handleAddMealFromCalendar = (dayOfCycle: number, mealType: MealType) => {
        setTempDayOfCycle(dayOfCycle)
        setTempMealType(mealType)
        setSelectedMealType(mealType)
        setAddMealDialogOpen(true)
    }

    const handleFoodSelected = (food: Food) => {
        if (!food) return

        const qty = parseFloat(quantity)
        if (isNaN(qty) || qty <= 0) {
            toast.error('Please enter a valid quantity')
            return
        }

        const newMeal: MealPlanMeal = {
            food,
            mealType: tempMealType,
            quantity: qty,
            dayOfCycle: tempDayOfCycle,
            order: meals.length + 1,
        }

        setMeals([...meals, newMeal])
        setSelectedFood(null)
        setQuantity('100')
        setAddMealDialogOpen(false)
        toast.success('Meal added')
    }

    const handleRemoveMealFromCalendar = (mealId: string, dayOfCycle: number, mealType: MealType) => {
        if (!mealId) {
            // Find meal by dayOfCycle and mealType
            const index = meals.findIndex(m => m.dayOfCycle === dayOfCycle && m.mealType === mealType)
            if (index !== -1) {
                handleRemoveMeal(index)
            }
        } else {
            const index = meals.findIndex(m => m.id === mealId)
            if (index !== -1) {
                handleRemoveMeal(index)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error('Please enter a plan name')
            return
        }

        if (meals.length === 0) {
            toast.error('Please add at least one meal')
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit({
                name,
                description,
                targetCalories: targetCalories ? parseFloat(targetCalories) : null,
                targetProtein: targetProtein ? parseFloat(targetProtein) : null,
                targetCarbs: targetCarbs ? parseFloat(targetCarbs) : null,
                targetFats: targetFats ? parseFloat(targetFats) : null,
                cycleDays,
                meals,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan Details</CardTitle>
                    <CardDescription>Basic information about this meal plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Plan Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Bulking Plan, Weight Loss Meals"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this meal plan..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Nutrition Targets */}
            <Card>
                <CardHeader>
                    <CardTitle>Nutrition Targets (Optional)</CardTitle>
                    <CardDescription>Set target macros for this plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Label htmlFor="targetCalories">Calories</Label>
                            <Input
                                id="targetCalories"
                                type="number"
                                value={targetCalories}
                                onChange={(e) => setTargetCalories(e.target.value)}
                                placeholder="2000"
                            />
                        </div>
                        <div>
                            <Label htmlFor="targetProtein">Protein (g)</Label>
                            <Input
                                id="targetProtein"
                                type="number"
                                value={targetProtein}
                                onChange={(e) => setTargetProtein(e.target.value)}
                                placeholder="150"
                            />
                        </div>
                        <div>
                            <Label htmlFor="targetCarbs">Carbs (g)</Label>
                            <Input
                                id="targetCarbs"
                                type="number"
                                value={targetCarbs}
                                onChange={(e) => setTargetCarbs(e.target.value)}
                                placeholder="200"
                            />
                        </div>
                        <div>
                            <Label htmlFor="targetFats">Fats (g)</Label>
                            <Input
                                id="targetFats"
                                type="number"
                                value={targetFats}
                                onChange={(e) => setTargetFats(e.target.value)}
                                placeholder="65"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cycle Days Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Meal Plan Cycle
                    </CardTitle>
                    <CardDescription>
                        Choose how many days are in your meal plan cycle
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {[7, 14, 28, 30].map((days) => (
                            <Button
                                key={days}
                                type="button"
                                variant={cycleDays === days ? 'default' : 'outline'}
                                onClick={() => setCycleDays(days)}
                                className="flex-1 min-w-[80px]"
                            >
                                {days} ngày
                            </Button>
                        ))}
                        <Button
                            type="button"
                            variant={![7, 14, 28, 30].includes(cycleDays) ? 'default' : 'outline'}
                            onClick={() => {
                                if ([7, 14, 28, 30].includes(cycleDays)) {
                                    setCycleDays(1) // Default to 1 day (Daily)
                                }
                            }}
                            className="flex-1 min-w-[80px]"
                        >
                            Tùy chỉnh
                        </Button>
                    </div>

                    {![7, 14, 28, 30].includes(cycleDays) && (
                        <div className="mt-4">
                            <Label htmlFor="custom-cycle">Số ngày của chu kỳ</Label>
                            <Input
                                id="custom-cycle"
                                type="number"
                                min="1"
                                max="90"
                                value={cycleDays}
                                onWheel={(e) => e.currentTarget.blur()}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    if (!isNaN(val) && val > 0) setCycleDays(val)
                                }}
                                className="mt-1 [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Nhập số ngày bất kỳ cho chu kỳ meal plan của bạn (ví dụ: 3 ngày, 10 ngày...).
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                        {cycleDays === 7 && '1 tuần lễ - Lặp lại mỗi tuần'}
                        {cycleDays === 14 && '2 tuần - Chu kỳ 2 tuần'}
                        {cycleDays === 28 && '4 tuần - Chu kỳ 1 tháng'}
                        {cycleDays === 30 && '30 ngày - Chu kỳ tháng đầy đủ'}
                    </p>
                </CardContent>
            </Card>

            {/* Calendar Meal Plan View */}
            <Card>
                <CardHeader>
                    <CardTitle>Meal Calendar</CardTitle>
                    <CardDescription>
                        Click "Thêm món" to add meals for specific days and meal types
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CalendarMealPlanView
                        cycleDays={cycleDays}
                        meals={mealsForCalendar}
                        onAddMeal={handleAddMealFromCalendar}
                        onRemoveMeal={handleRemoveMealFromCalendar}
                    />
                </CardContent>
            </Card>

            {/* Add Meal Dialog */}
            <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Add Meal - Day {tempDayOfCycle} - {tempMealType}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <QuickMealInput onSelectFood={handleFoodSelected} />
                        <div>
                            <Label htmlFor="dialog-quantity">Quantity (grams)</Label>
                            <Input
                                id="dialog-quantity"
                                type="number"
                                value={quantity}
                                onWheel={(e) => e.currentTarget.blur()}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="100"
                                className="[&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[150px]"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {isEditing ? 'Update Plan' : 'Create Plan'}
                </Button>
            </div>
        </form>
    )
}
