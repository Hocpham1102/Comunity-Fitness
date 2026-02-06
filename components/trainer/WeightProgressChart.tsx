'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useState } from 'react'

interface WeightDataPoint {
    date: string
    weight: number
    target?: number
}

interface WeightProgressChartProps {
    data: WeightDataPoint[]
    targetWeight?: number
}

export function WeightProgressChart({ data, targetWeight }: WeightProgressChartProps) {
    const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M')

    // Filter data based on time range
    const getFilteredData = () => {
        if (timeRange === 'ALL') return data

        const now = new Date()
        const monthsAgo = {
            '1M': 1,
            '3M': 3,
            '6M': 6,
            '1Y': 12,
        }[timeRange]

        const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsAgo))

        return data.filter((point) => new Date(point.date) >= cutoffDate)
    }

    const filteredData = getFilteredData()

    // Add target weight to each data point for the reference line
    const chartData = filteredData.map((point) => ({
        ...point,
        target: targetWeight,
    }))

    if (filteredData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Weight Chart</CardTitle>
                    <CardDescription>Track weight progress over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No weight data available
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Weight Chart</CardTitle>
                        <CardDescription>Track weight progress over time</CardDescription>
                    </div>
                    <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1M">1 Month</SelectItem>
                            <SelectItem value="3M">3 Months</SelectItem>
                            <SelectItem value="6M">6 Months</SelectItem>
                            <SelectItem value="1Y">1 Year</SelectItem>
                            <SelectItem value="ALL">All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return `${date.getDate()}/${date.getMonth() + 1}`
                            }}
                        />
                        <YAxis
                            label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                            formatter={(value: number) => [`${value} kg`, '']}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Actual weight"
                            dot={{ fill: 'hsl(var(--primary))' }}
                        />
                        {targetWeight && (
                            <Line
                                type="monotone"
                                dataKey="target"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Target"
                                dot={false}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
