'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Mail, Calendar, Activity, Dumbbell, Apple, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { ClientNotes } from '@/components/trainer/ClientNotes'
import { WeightProgressChart } from '@/components/trainer/WeightProgressChart'
import { MeasurementsChart } from '@/components/trainer/MeasurementsChart'
import { NutritionAdherence } from '@/components/trainer/NutritionAdherence'
import { MacroCard } from '@/components/trainer/MacroCard'
import { ClientDetailSkeleton } from '@/components/trainer/ClientSkeletons'

interface ClientDetails {
    client: any
    relationship: any
    stats: {
        completedWorkouts: number
        totalWorkouts: number
        workoutCompletionRate: number
    }
    weightData?: Array<{ date: string; weight: number }>
    measurementsData?: Array<{
        date: string
        weight?: number
        bodyFat?: number
        muscleMass?: number
        chest?: number
        waist?: number
        hips?: number
    }>
    nutritionAdherence?: Array<{
        date: string
        adherence: number
        mealsLogged: number
        totalMeals: number
    }>
    avgMacros?: {
        protein: number
        carbs: number
        fats: number
        calories: number
    }
    targetMacros?: {
        protein: number
        carbs: number
        fats: number
        calories: number
    }
}

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [data, setData] = useState<ClientDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const response = await fetch(`/api/trainer/clients/${params.clientId}`)
                if (response.ok) {
                    const clientData = await response.json()
                    setData(clientData)
                } else {
                    router.push('/trainer/clients')
                }
            } catch (error) {
                console.error('Error fetching client details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (params.clientId) {
            fetchClientDetails()
        }
    }, [params.clientId, router])

    if (loading) {
        return <ClientDetailSkeleton />
    }

    if (!data) {
        return null
    }

    const { client, relationship, stats, weightData = [], measurementsData = [], nutritionAdherence = [], avgMacros, targetMacros } = data

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch(`/api/trainer/clients/${params.clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    endDate: newStatus === 'CANCELLED' ? new Date().toISOString() : null
                }),
            })

            if (response.ok) {
                toast({
                    title: 'Đã cập nhật',
                    description: 'Trạng thái khách hàng đã được cập nhật',
                })
                // Refresh data
                const refreshResponse = await fetch(`/api/trainer/clients/${params.clientId}`)
                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json()
                    setData(refreshedData)
                }
            } else {
                toast({
                    title: 'Lỗi',
                    description: 'Không thể cập nhật trạng thái',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast({
                title: 'Lỗi',
                description: 'Đã xảy ra lỗi khi cập nhật',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button asChild variant="ghost" size="sm" className="mb-4">
                    <Link href="/trainer/clients">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Clients
                    </Link>
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{client.name || 'Unnamed Client'}</h1>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {client.email}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Since {new Date(relationship.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <Badge className={relationship.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {relationship.status}
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Workouts</CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedWorkouts}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.workoutCompletionRate}% completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {client.profile?.currentWeight || 'N/A'} kg
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target: {client.profile?.targetWeight || 'N/A'} kg
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="workouts">Workouts</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Status Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quản Lý Trạng Thái</CardTitle>
                            <CardDescription>Cập nhật trạng thái của khách hàng</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-2 block">Trạng thái hiện tại</label>
                                    <Select value={relationship.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INVITED">Đã mời</SelectItem>
                                            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                                            <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                                            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {relationship.status === 'CANCELLED' && relationship.endDate && (
                                    <div className="text-sm text-muted-foreground">
                                        Kết thúc: {new Date(relationship.endDate).toLocaleDateString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Notes */}
                    <ClientNotes
                        clientId={params.clientId as string}
                        initialNotes={relationship.notes || ''}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông Tin Cá Nhân</CardTitle>
                            <CardDescription>Thông tin và mục tiêu thể hình</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {client.profile ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium">Gender</p>
                                        <p className="text-sm text-muted-foreground">{client.profile.gender || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Height</p>
                                        <p className="text-sm text-muted-foreground">{client.profile.height || 'Not set'} cm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Activity Level</p>
                                        <p className="text-sm text-muted-foreground">{client.profile.activityLevel || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Fitness Goal</p>
                                        <p className="text-sm text-muted-foreground">{client.profile.fitnessGoal || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">BMI</p>
                                        <p className="text-sm text-muted-foreground">{client.profile.bmi?.toFixed(1) || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">TDEE</p>
                                        <p className="text-sm text-muted-foreground">{client.profile.tdee || 'Not set'} kcal</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No profile information available</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage this client's programs</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <Button asChild className="flex-1">
                                <Link href={`/trainer/workouts/assign?clientId=${client.id}`}>
                                    <Dumbbell className="w-4 h-4 mr-2" />
                                    Assign Workout
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href={`/trainer/nutrition/assign?clientId=${client.id}`}>
                                    <Apple className="w-4 h-4 mr-2" />
                                    Assign Meal Plan
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="workouts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workout History</CardTitle>
                            <CardDescription>Recent workout sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {client.workoutLogs && client.workoutLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {client.workoutLogs.map((log: any) => (
                                        <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{log.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(log.startedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant={log.completedAt ? 'default' : 'secondary'}>
                                                {log.completedAt ? 'Completed' : 'In Progress'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No workout history yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nutrition">
                    <div className="space-y-4">
                        {/* Nutrition Adherence */}
                        <NutritionAdherence data={nutritionAdherence} />

                        {/* Macro Breakdown */}
                        {avgMacros && targetMacros && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Phân Bổ Macro</CardTitle>
                                    <CardDescription>Trung bình hàng ngày so với mục tiêu</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <MacroCard
                                            label="Protein"
                                            actual={avgMacros.protein}
                                            target={targetMacros.protein}
                                            unit="g"
                                        />
                                        <MacroCard
                                            label="Carbs"
                                            actual={avgMacros.carbs}
                                            target={targetMacros.carbs}
                                            unit="g"
                                        />
                                        <MacroCard
                                            label="Fats"
                                            actual={avgMacros.fats}
                                            target={targetMacros.fats}
                                            unit="g"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Nhật Ký Dinh Dưỡng Gần Đây</CardTitle>
                                <CardDescription>Các bữa ăn đã ghi nhận</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {client.nutritionLogs && client.nutritionLogs.length > 0 ? (
                                    <div className="space-y-3">
                                        {client.nutritionLogs.slice(0, 10).map((log: any) => (
                                            <div key={log.id} className="flex justify-between items-center p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{log.food?.name || 'Unknown'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {log.mealType} • {new Date(log.consumedAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <p className="font-medium">{log.calories || 0} kcal</p>
                                                    <p className="text-muted-foreground">
                                                        P: {log.protein || 0}g C: {log.carbs || 0}g F: {log.fats || 0}g
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Chưa có nhật ký dinh dưỡng
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="progress">
                    <div className="space-y-4">
                        {/* Weight Progress Chart */}
                        <WeightProgressChart
                            data={weightData}
                            targetWeight={client.profile?.targetWeight}
                        />

                        {/* Measurements Chart */}
                        <MeasurementsChart data={measurementsData} />

                        {/* Measurements History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch Sử Số Đo</CardTitle>
                                <CardDescription>Số đo cơ thể và ảnh tiến độ</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {client.profile?.measurements && client.profile.measurements.length > 0 ? (
                                    <div className="space-y-4">
                                        {client.profile.measurements.map((measurement: any) => (
                                            <div key={measurement.id} className="p-4 border rounded-lg">
                                                <p className="font-medium">
                                                    {new Date(measurement.measuredAt).toLocaleDateString('vi-VN')}
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                                    {measurement.weight && (
                                                        <div>
                                                            <span className="text-muted-foreground">Cân nặng: </span>
                                                            {measurement.weight} kg
                                                        </div>
                                                    )}
                                                    {measurement.bodyFat && (
                                                        <div>
                                                            <span className="text-muted-foreground">% Mỡ: </span>
                                                            {measurement.bodyFat}%
                                                        </div>
                                                    )}
                                                    {measurement.muscleMass && (
                                                        <div>
                                                            <span className="text-muted-foreground">Cơ: </span>
                                                            {measurement.muscleMass} kg
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Chưa có số đo nào được ghi nhận
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
