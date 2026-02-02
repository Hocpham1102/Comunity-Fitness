'use client'

import { MealPlanCard } from './MealPlanCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Apple } from 'lucide-react'

interface MealPlan {
    id: string
    name: string
    description: string | null
    targetCalories: number | null
    targetProtein: number | null
    targetCarbs: number | null
    targetFats: number | null
    cycleDays: number
    mealCount: number
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFats: number
}

interface MealPlanListProps {
    plans: MealPlan[]
    isLoading?: boolean
    onDelete?: (id: string) => void
    onAssign?: (id: string) => void
}

export function MealPlanList({ plans, isLoading, onDelete, onAssign }: MealPlanListProps) {

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['skeleton-1', 'skeleton-2', 'skeleton-3'].map((key) => (
                    <Card key={key}>
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </div>
                            <Skeleton className="h-9 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (plans.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Apple className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Meal Plans Yet</h3>
                    <p className="text-muted-foreground">
                        Create your first meal plan to get started
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
                <MealPlanCard
                    key={plan.id}
                    plan={plan}
                    onDelete={onDelete}
                    onAssign={onAssign}
                />
            ))}
        </div>
    )
}
