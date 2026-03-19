'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Edit, Trash2, UserPlus, Calendar, Apple } from 'lucide-react'
import Link from 'next/link'

interface MealPlanCardProps {
    plan: {
        id: string
        name: string
        description: string | null
        targetCalories: number | null
        targetProtein: number | null
        targetCarbs: number | null
        targetFats: number | null
        mealCount: number
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFats: number
    }
    onDelete?: (id: string) => void
    onAssign?: (id: string) => void
}

export function MealPlanCard({ plan, onDelete, onAssign }: MealPlanCardProps) {
    const calculateProgress = (actual: number, target: number | null) => {
        if (!target) return 0
        return Math.min((actual / target) * 100, 100)
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 min-w-0">
                            <Apple className="w-5 h-5 text-green-600 shrink-0" />
                            <span className="truncate">{plan.name}</span>
                        </CardTitle>
                        {plan.description && (
                            <CardDescription className="mt-1">
                                {plan.description}
                            </CardDescription>
                        )}
                    </div>
                    <Badge variant="secondary">{plan.mealCount} bữa ăn</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Nutrition Totals */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                    <div>
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="text-lg font-bold">{plan.totalCalories}</p>
                        {plan.targetCalories && (
                            <>
                                <Progress
                                    value={calculateProgress(plan.totalCalories, plan.targetCalories)}
                                    className="h-1 mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Target: {plan.targetCalories}
                                </p>
                            </>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="text-lg font-bold">{plan.totalProtein}g</p>
                        {plan.targetProtein && (
                            <>
                                <Progress
                                    value={calculateProgress(plan.totalProtein, plan.targetProtein)}
                                    className="h-1 mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Target: {plan.targetProtein}g
                                </p>
                            </>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="text-lg font-bold">{plan.totalCarbs}g</p>
                        {plan.targetCarbs && (
                            <>
                                <Progress
                                    value={calculateProgress(plan.totalCarbs, plan.targetCarbs)}
                                    className="h-1 mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Target: {plan.targetCarbs}g
                                </p>
                            </>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Fats</p>
                        <p className="text-lg font-bold">{plan.totalFats}g</p>
                        {plan.targetFats && (
                            <>
                                <Progress
                                    value={calculateProgress(plan.totalFats, plan.targetFats)}
                                    className="h-1 mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Target: {plan.targetFats}g
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm" className="flex-1">
                        <Link href={`/trainer/meal-plans/${plan.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </Link>
                    </Button>
                    {onAssign && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => onAssign(plan.id)}
                        >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assign
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(plan.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
