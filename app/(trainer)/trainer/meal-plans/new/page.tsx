'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MealPlanForm } from '@/components/features/nutrition/MealPlanForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewMealPlanPage() {
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            // First, create the meal plan
            const planResponse = await fetch('/api/trainer/meal-plans', {
                method: 'POST',
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
                throw new Error('Failed to create meal plan')
            }

            const createdPlan = await planResponse.json()

            // Then, add all the meals to the plan
            for (const meal of data.meals) {
                const mealResponse = await fetch(`/api/trainer/meal-plans/${createdPlan.id}/meals`, {
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

            toast.success('Meal plan created successfully!')
            router.push('/trainer/nutrition')
        } catch (error: any) {
            console.error('Error creating meal plan:', error)
            toast.error(error.message || 'Failed to create meal plan')
            throw error
        }
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
                <h1 className="text-3xl font-bold">Create New Meal Plan</h1>
                <p className="text-muted-foreground mt-2">
                    Build a meal plan template that you can assign to your clients
                </p>
            </div>

            <MealPlanForm onSubmit={handleSubmit} />
        </div>
    )
}
