'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle } from 'lucide-react'

interface DayAdherence {
    date: string
    adherence: number
    mealsLogged: number
    totalMeals: number
}

interface NutritionAdherenceProps {
    data: DayAdherence[]
}

export function NutritionAdherence({ data }: NutritionAdherenceProps) {
    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Nutrition Adherence</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No nutrition data available
                    </p>
                </CardContent>
            </Card>
        )
    }

    const averageAdherence = data.reduce((sum, day) => sum + day.adherence, 0) / data.length

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Nutrition Adherence</CardTitle>
                        <CardDescription>Last 7 days</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{averageAdherence.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Average</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((day) => {
                        const isGood = day.adherence >= 80
                        return (
                            <div key={day.date} className="flex items-center gap-3">
                                <div className="w-24 text-sm font-medium">
                                    {new Date(day.date).toLocaleDateString('vi-VN', {
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: '2-digit'
                                    })}
                                </div>
                                <div className="flex-1">
                                    <Progress value={day.adherence} className="h-2" />
                                </div>
                                <div className="w-16 text-right text-sm font-medium">
                                    {day.adherence.toFixed(0)}%
                                </div>
                                <div className="w-20 text-xs text-muted-foreground text-right">
                                    {day.mealsLogged}/{day.totalMeals} meals
                                </div>
                                {isGood ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-orange-500" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
