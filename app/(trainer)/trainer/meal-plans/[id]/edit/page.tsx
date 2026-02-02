'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MealPlanForm } from '@/components/features/nutrition/MealPlanForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

export default function EditMealPlanPage() {
    const router = useRouter()
    const params = useParams()
    const [planData, setPlanData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPlanData()
    }, [params.id])

    const fetchPlanData = async () => {
        try {
            const response = await fetch(`/api/trainer/meal-plans/${params.id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch meal plan')
            }
            const data = await response.json()

            // Transform the data to match the form's expected structure
            const transformedData = {
                ...data,
                meals: (data.meals || []).map((meal: any) => {
                    // Check if meal and food exist to prevent crashes
                    if (!meal || !meal.food) return null
                    return {
                        id: meal.id,
                        food: meal.food,
                        mealType: meal.mealType,
                        quantity: meal.quantity,
                        dayOfCycle: meal.dayOfCycle || 1,
                        order: meal.order || 0,
                    }
                }).filter((m: any) => m !== null),
            }

            setPlanData(transformedData)
        } catch (error: any) {
            console.error('Error fetching meal plan:', error)
            toast.error(error.message || 'Failed to load meal plan')
            // Don't redirect on error to allow debugging
            // router.push('/trainer/nutrition')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (data: any) => {
        try {
            // Update the meal plan details
            const planResponse = await fetch(`/api/trainer/meal-plans/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    description: data.description,
                    targetCalories: data.targetCalories,
                    targetProtein: data.targetProtein,
                    targetCarbs: data.targetCarbs,
                    targetFats: data.targetFats,
                }),
            })

            if (!planResponse.ok) {
                throw new Error('Failed to update meal plan')
            }

            // Fetch current meals from database before deleting
            // This ensures we delete the actual current meals, not stale data
            const currentPlanResponse = await fetch(`/api/trainer/meal-plans/${params.id}`)
            if (currentPlanResponse.ok) {
                const currentPlan = await currentPlanResponse.json()

                // Delete all existing meals
                if (currentPlan.meals && currentPlan.meals.length > 0) {
                    for (const meal of currentPlan.meals) {
                        await fetch(`/api/trainer/meal-plans/${params.id}/meals/${meal.id}`, {
                            method: 'DELETE',
                        })
                    }
                }
            }

            // Add new meals
            for (const meal of data.meals) {
                const mealResponse = await fetch(`/api/trainer/meal-plans/${params.id}/meals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        foodId: meal.food.id,
                        mealType: meal.mealType,
                        quantity: meal.quantity,
                        order: meal.order,
                    }),
                })

                if (!mealResponse.ok) {
                    console.error('Failed to add meal:', meal)
                }
            }

            toast.success('Meal plan updated successfully!')
            router.push('/trainer/nutrition')
        } catch (error: any) {
            console.error('Error updating meal plan:', error)
            toast.error(error.message || 'Failed to update meal plan')
            throw error
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-5xl py-8">
                <Card>
                    <CardContent className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!planData) {
        return (
            <div className="container mx-auto max-w-5xl py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="rounded-full bg-red-100 p-3 mb-4">
                            <X className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Could not load meal plan</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            There was an error loading the meal plan data. Please check the console for details or try again.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/trainer/nutrition">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Meal Plans
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="mb-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/trainer/nutrition">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Meal Plans
                    </Link>
                </Button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Edit Meal Plan</h1>
                <p className="text-muted-foreground mt-2">
                    Update your meal plan template
                </p>
            </div>

            <MealPlanForm
                initialData={planData}
                onSubmit={handleSubmit}
                isEditing
            />
        </div>
    )
}
