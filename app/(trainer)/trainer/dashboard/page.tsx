'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/trainer/StatsCard'
import { Users, BookOpen, DollarSign, TrendingUp, UserPlus, Dumbbell, Apple, Plus } from 'lucide-react'
import Link from 'next/link'

interface TrainerStats {
    activeClients: number
    totalCourses: number
    publishedCourses: number
    courseEnrollments: number
    totalRevenue: number
    recentWorkouts: number
    newClientsThisMonth: number
}

export default function TrainerDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<TrainerStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/trainer/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name || 'Trainer'}! 👋</h1>
                <p className="text-muted-foreground mt-2">
                    Here's what's happening with your clients and courses today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Active Clients"
                    value={stats?.activeClients || 0}
                    description={`+${stats?.newClientsThisMonth || 0} this month`}
                    icon={Users}
                    trend={{
                        value: stats?.newClientsThisMonth || 0,
                        isPositive: true,
                    }}
                />
                <StatsCard
                    title="Total Courses"
                    value={stats?.totalCourses || 0}
                    description={`${stats?.publishedCourses || 0} published`}
                    icon={BookOpen}
                />
                <StatsCard
                    title="Course Enrollments"
                    value={stats?.courseEnrollments || 0}
                    description="Total students"
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Recent Activity"
                    value={stats?.recentWorkouts || 0}
                    description="Workouts this week"
                    icon={Dumbbell}
                />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks to get you started</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button asChild className="h-auto py-4 flex-col gap-2">
                            <Link href="/trainer/clients/invite">
                                <UserPlus className="w-6 h-6" />
                                <span>Invite New Client</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/trainer/workouts/create">
                                <Dumbbell className="w-6 h-6" />
                                <span>Create Workout</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/trainer/meal-plans/new">
                                <Apple className="w-6 h-6" />
                                <span>Create Meal Plan</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/trainer/courses/create">
                                <Plus className="w-6 h-6" />
                                <span>Create Course</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity & Upcoming */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Activity feed coming soon...
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Sessions</CardTitle>
                        <CardDescription>Your scheduled check-ins</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No upcoming sessions scheduled
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
