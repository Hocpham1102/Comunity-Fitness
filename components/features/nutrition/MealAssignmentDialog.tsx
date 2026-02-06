'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { QuickMealInput } from './QuickMealInput'
import { X, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MealAssignmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    scheduleId: string
    selectedDate: Date | null
    onSuccess: () => void
}

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

export function MealAssignmentDialog({
    open,
    onOpenChange,
    scheduleId,
    selectedDate,
    onSuccess
}: MealAssignmentDialogProps) {
    const [loading, setLoading] = useState(false)
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)

    const [formData, setFormData] = useState({
        mealType: 'BREAKFAST' as string,
        quantity: '100',
        notes: '',
    })

    useEffect(() => {
        if (open) {
            setFormData({
                mealType: 'BREAKFAST',
                quantity: '100',
                notes: '',
            })
            setSelectedFood(null)
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedFood) {
            toast.error('Please select a food item')
            return
        }

        if (!selectedDate) {
            toast.error('Please select a date')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/meal-schedules/${scheduleId}/meals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    foodId: selectedFood.id,
                    mealType: formData.mealType,
                    scheduledDate: selectedDate.toISOString(),
                    quantity: parseFloat(formData.quantity),
                    notes: formData.notes || null,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to add meal')
            }

            toast.success('Meal added to schedule')
            onSuccess()
        } catch (error) {
            console.error('Error adding meal:', error)
            toast.error('Unable to add meal')
        } finally {
            setLoading(false)
        }
    }

    const calculateNutrition = () => {
        if (!selectedFood || !formData.quantity) return null

        const multiplier = parseFloat(formData.quantity) / 100
        return {
            calories: selectedFood.calories * multiplier,
            protein: selectedFood.protein * multiplier,
            carbs: selectedFood.carbs * multiplier,
            fats: selectedFood.fats * multiplier,
        }
    }

    const nutrition = calculateNutrition()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Meal to Schedule</DialogTitle>
                    <DialogDescription>
                        {selectedDate && `Date: ${selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Food Search */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Find Food</Label>
                        {!selectedFood ? (
                            <QuickMealInput onSelectFood={setSelectedFood} />
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
                                    ✓ Food selected. Configure details below.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Meal Configuration - Only show when food is selected */}
                    {selectedFood && (
                        <>
                            {/* Meal Type */}
                            <div className="space-y-2">
                                <Label htmlFor="mealType" className="text-base font-semibold">Meal Type *</Label>
                                <Select
                                    value={formData.mealType}
                                    onValueChange={(value) => setFormData({ ...formData, mealType: value })}
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BREAKFAST">🌅 Breakfast</SelectItem>
                                        <SelectItem value="LUNCH">☀️ Lunch</SelectItem>
                                        <SelectItem value="DINNER">🌙 Dinner</SelectItem>
                                        <SelectItem value="SNACK">🍎 Snack</SelectItem>
                                        <SelectItem value="PRE_WORKOUT">💪 Pre-Workout</SelectItem>
                                        <SelectItem value="POST_WORKOUT">✨ Post-Workout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-base font-semibold">Quantity (grams) *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="100"
                                    min="1"
                                    className="h-12 text-lg"
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter quantity in grams (e.g., 100g, 250g, 350g)
                                </p>
                            </div>

                            {/* Nutrition Preview */}
                            {nutrition && (
                                <div className="p-4 rounded-lg bg-muted border-2">
                                    <h4 className="font-semibold mb-3">Expected Nutrition</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{nutrition.calories.toFixed(0)}</div>
                                            <div className="text-xs text-muted-foreground">Calories</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{nutrition.protein.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">Protein (g)</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{nutrition.carbs.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">Carbs (g)</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{nutrition.fats.toFixed(1)}</div>
                                            <div className="text-xs text-muted-foreground">Fats (g)</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add notes about this meal..."
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="lg" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Meal'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
