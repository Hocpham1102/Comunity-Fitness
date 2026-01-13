'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface NutritionStatsProps {
    stats: {
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFats: number
    }
    goals?: {
        calories: number
        protein: number
        carbs: number
        fats: number
    }
}

export function NutritionStats({ stats, goals }: NutritionStatsProps) {
    const defaultGoals = goals || {
        calories: 2200,
        protein: 165,
        carbs: 275,
        fats: 73,
    }

    const calculatePercentage = (current: number, goal: number) => {
        return Math.min(100, (current / goal) * 100)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today's Nutrition Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Calories */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Calories</span>
                        <span className="text-sm text-muted-foreground">
                            {stats.totalCalories.toFixed(0)} / {defaultGoals.calories} kcal
                        </span>
                    </div>
                    <Progress value={calculatePercentage(stats.totalCalories, defaultGoals.calories)} />
                </div>

                {/* Protein */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Protein</span>
                        <span className="text-sm text-muted-foreground">
                            {stats.totalProtein.toFixed(1)} / {defaultGoals.protein}g
                        </span>
                    </div>
                    <Progress
                        value={calculatePercentage(stats.totalProtein, defaultGoals.protein)}
                        className="[&>div]:bg-blue-500"
                    />
                </div>

                {/* Carbs */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Carbs</span>
                        <span className="text-sm text-muted-foreground">
                            {stats.totalCarbs.toFixed(1)} / {defaultGoals.carbs}g
                        </span>
                    </div>
                    <Progress
                        value={calculatePercentage(stats.totalCarbs, defaultGoals.carbs)}
                        className="[&>div]:bg-green-500"
                    />
                </div>

                {/* Fats */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Fats</span>
                        <span className="text-sm text-muted-foreground">
                            {stats.totalFats.toFixed(1)} / {defaultGoals.fats}g
                        </span>
                    </div>
                    <Progress
                        value={calculatePercentage(stats.totalFats, defaultGoals.fats)}
                        className="[&>div]:bg-yellow-500"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
