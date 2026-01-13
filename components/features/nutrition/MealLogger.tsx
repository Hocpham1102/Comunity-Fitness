'use client'

import { useState } from 'react'
import { FoodSearch } from './FoodSearch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, X, Check, Apple, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

const MEAL_TYPES = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
    { value: 'LUNCH', label: 'Lunch', icon: '☀️' },
    { value: 'DINNER', label: 'Dinner', icon: '🌙' },
    { value: 'SNACK', label: 'Snack', icon: '🍎' },
    { value: 'PRE_WORKOUT', label: 'Pre-Workout', icon: '💪' },
    { value: 'POST_WORKOUT', label: 'Post-Workout', icon: '✨' },
]

interface MealLoggerProps {
    onSuccess?: () => void
}

export function MealLogger({ onSuccess }: MealLoggerProps) {
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)
    const [mealType, setMealType] = useState<string>('BREAKFAST')
    const [quantity, setQuantity] = useState<string>('100')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const calculateNutrition = () => {
        if (!selectedFood || !quantity) return null

        const multiplier = parseFloat(quantity) / 100
        return {
            calories: selectedFood.calories * multiplier,
            protein: selectedFood.protein * multiplier,
            carbs: selectedFood.carbs * multiplier,
            fats: selectedFood.fats * multiplier,
        }
    }

    const nutrition = calculateNutrition()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedFood) {
            toast.error('Please select a food')
            return
        }

        if (!quantity || parseFloat(quantity) <= 0) {
            toast.error('Please enter a valid quantity')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/nutrition-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    foodId: selectedFood.id,
                    mealType,
                    quantity: parseFloat(quantity),
                    notes: notes || undefined,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to log meal')
            }

            toast.success('Meal logged successfully')

            // Reset form
            setSelectedFood(null)
            setQuantity('100')
            setNotes('')

            onSuccess?.()
        } catch (error) {
            console.error('Error logging meal:', error)
            toast.error('Failed to log meal')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Food Selection */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Apple className="w-5 h-5 text-primary" />
                            Select Food
                        </CardTitle>
                        <CardDescription>Search for the food you want to log</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedFood ? (
                            <FoodSearch onSelectFood={setSelectedFood} />
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check className="w-5 h-5 text-primary" />
                                            <h3 className="font-semibold text-lg">{selectedFood.name}</h3>
                                        </div>
                                        {selectedFood.description && (
                                            <p className="text-sm text-muted-foreground mb-3">{selectedFood.description}</p>
                                        )}
                                        <div className="flex gap-3 text-sm">
                                            <Badge variant="secondary">{selectedFood.calories.toFixed(0)} kcal</Badge>
                                            <Badge variant="outline">P: {selectedFood.protein.toFixed(1)}g</Badge>
                                            <Badge variant="outline">C: {selectedFood.carbs.toFixed(1)}g</Badge>
                                            <Badge variant="outline">F: {selectedFood.fats.toFixed(1)}g</Badge>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedFood(null)}
                                        className="hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    ✓ Food selected. Configure your meal details below.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedFood && (
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>Meal Details</CardTitle>
                            <CardDescription>Configure when and how much you ate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Meal Type */}
                                <div className="space-y-3">
                                    <Label htmlFor="mealType" className="text-base font-semibold">Meal Type</Label>
                                    <Select value={mealType} onValueChange={setMealType}>
                                        <SelectTrigger id="mealType" className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEAL_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value} className="h-12">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{type.icon}</span>
                                                        <span>{type.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-3">
                                    <Label htmlFor="quantity" className="text-base font-semibold">Quantity (grams)</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="100"
                                        className="h-12 text-lg"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Enter the amount in grams (e.g., 100g, 250g, 350g)
                                    </p>
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <Label htmlFor="notes" className="text-base font-semibold">Notes (optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes about your meal..."
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={loading}>
                                    {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                                    {loading ? 'Logging Meal...' : 'Log Meal'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column - Nutrition Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-6">
                    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-primary" />
                                Nutrition Summary
                            </CardTitle>
                            <CardDescription>Calculated based on your quantity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {nutrition ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-background border-2">
                                        <div className="text-sm text-muted-foreground mb-1">Total Calories</div>
                                        <div className="text-3xl font-bold text-primary">{nutrition.calories.toFixed(0)}</div>
                                        <div className="text-sm text-muted-foreground">kcal</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-lg bg-background border text-center">
                                            <div className="text-xs text-muted-foreground mb-1">Protein</div>
                                            <div className="text-xl font-bold text-blue-600">{nutrition.protein.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">g</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background border text-center">
                                            <div className="text-xs text-muted-foreground mb-1">Carbs</div>
                                            <div className="text-xl font-bold text-green-600">{nutrition.carbs.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">g</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background border text-center">
                                            <div className="text-xs text-muted-foreground mb-1">Fats</div>
                                            <div className="text-xl font-bold text-yellow-600">{nutrition.fats.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">g</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="text-sm text-muted-foreground text-center">
                                            For <span className="font-semibold text-foreground">{quantity}g</span> of{' '}
                                            <span className="font-semibold text-foreground">{selectedFood?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Select a food and enter quantity to see nutrition breakdown</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
