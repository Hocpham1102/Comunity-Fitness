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
                    <CardTitle>Biểu Đồ Cân Nặng</CardTitle>
                    <CardDescription>Theo dõi tiến độ cân nặng theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        Chưa có dữ liệu cân nặng
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
                        <CardTitle>Biểu Đồ Cân Nặng</CardTitle>
                        <CardDescription>Theo dõi tiến độ cân nặng theo thời gian</CardDescription>
                    </div>
                    <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1M">1 Tháng</SelectItem>
                            <SelectItem value="3M">3 Tháng</SelectItem>
                            <SelectItem value="6M">6 Tháng</SelectItem>
                            <SelectItem value="1Y">1 Năm</SelectItem>
                            <SelectItem value="ALL">Tất Cả</SelectItem>
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
                            label={{ value: 'Cân nặng (kg)', angle: -90, position: 'insideLeft' }}
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
                            name="Cân nặng thực tế"
                            dot={{ fill: 'hsl(var(--primary))' }}
                        />
                        {targetWeight && (
                            <Line
                                type="monotone"
                                dataKey="target"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Mục tiêu"
                                dot={false}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
