'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface MeasurementDataPoint {
    date: string
    weight?: number
    bodyFat?: number
    muscleMass?: number
    chest?: number
    waist?: number
    hips?: number
}

interface MeasurementsChartProps {
    data: MeasurementDataPoint[]
}

export function MeasurementsChart({ data }: MeasurementsChartProps) {
    const [metric, setMetric] = useState<'body' | 'measurements'>('body')

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Biểu Đồ Số Đo</CardTitle>
                    <CardDescription>Theo dõi thay đổi số đo cơ thể</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        Chưa có dữ liệu số đo
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
                        <CardTitle>Biểu Đồ Số Đo</CardTitle>
                        <CardDescription>Theo dõi thay đổi số đo cơ thể</CardDescription>
                    </div>
                    <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="body">Cơ Thể</SelectItem>
                            <SelectItem value="measurements">Số Đo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return `${date.getDate()}/${date.getMonth() + 1}`
                            }}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                        />
                        <Legend />

                        {metric === 'body' ? (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    name="Cân nặng (kg)"
                                    dot={{ fill: '#8884d8' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bodyFat"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    name="% Mỡ"
                                    dot={{ fill: '#82ca9d' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="muscleMass"
                                    stroke="#ffc658"
                                    strokeWidth={2}
                                    name="Khối cơ (kg)"
                                    dot={{ fill: '#ffc658' }}
                                />
                            </>
                        ) : (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="chest"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    name="Ngực (cm)"
                                    dot={{ fill: '#8884d8' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="waist"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    name="Eo (cm)"
                                    dot={{ fill: '#82ca9d' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="hips"
                                    stroke="#ffc658"
                                    strokeWidth={2}
                                    name="Mông (cm)"
                                    dot={{ fill: '#ffc658' }}
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
