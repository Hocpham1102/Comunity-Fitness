'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MacroCardProps {
    label: string
    actual: number
    target: number
    unit: string
    color?: string
}

export function MacroCard({ label, actual, target, unit, color = 'hsl(var(--primary))' }: MacroCardProps) {
    const percentage = target > 0 ? Math.min((actual / target) * 100, 100) : 0
    const isOver = actual > target
    const difference = Math.abs(actual - target)

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{actual.toFixed(0)}</span>
                    <span className="text-sm text-muted-foreground">/ {target} {unit}</span>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="flex items-center justify-between text-xs">
                    <span className={isOver ? 'text-orange-500' : 'text-green-500'}>
                        {isOver ? `+${difference.toFixed(0)}` : `-${difference.toFixed(0)}`} {unit}
                    </span>
                    <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                </div>
            </CardContent>
        </Card>
    )
}
