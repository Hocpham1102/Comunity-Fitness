'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/trainer/StatsCard'
import { Users, BookOpen, TrendingUp, UserPlus, Dumbbell, Apple, Plus } from 'lucide-react'
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

            {/* Onboarding Banner */}
            <OnboardingBanner />

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
                            <Link href="/trainer/courses?action=create">
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

// ─── Onboarding Banner ──────────────────────────────────────────────────────────
function OnboardingBanner() {
    const { data: session } = useSession()
    const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null | 'loading'>('loading')
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        if (!session?.user?.id) return
        fetch('/api/trainer/verification-request')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setIsVerified(data.isVerified ?? false)
                    setStatus(data.request?.status ?? null)
                }
            })
            .catch(() => setStatus(null))
    }, [session?.user?.id])

    // Hide when verified or still loading
    if (status === 'loading' || isVerified) return null

    const step2Icon = status === 'PENDING' ? '🕐' : status === 'REJECTED' ? '❌' : '⏳'
    const step2Label =
        status === 'PENDING'
            ? "Pending admin review — we'll notify you once approved"
            : status === 'REJECTED'
                ? 'Your request was rejected — please review and resubmit'
                : 'Submit your credentials so an admin can approve you'
    const step2Btn = status === 'REJECTED' ? 'Resubmit Request →' : 'Request Verification →'

    return (
        <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">🚀 Get started — 2 steps to unlock all features</CardTitle>
                <CardDescription>
                    Complete these steps to access Clients, Courses, and Meal Plans.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Step 1 — always done */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                    <span className="text-lg mt-0.5">✅</span>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                            Step 1: Set up your Trainer Profile
                            <span className="text-xs font-normal text-green-600 dark:text-green-400">Done!</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Your public info visible to clients — bio, specializations, hourly rate, social links.
                        </div>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="shrink-0 text-xs h-7">
                        <Link href="/trainer/profile">Edit Profile</Link>
                    </Button>
                </div>

                {/* Step 2 — verification */}
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${status === 'PENDING'
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
                        : status === 'REJECTED'
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                            : 'bg-background/60 border-border'
                    }`}>
                    <span className="text-lg mt-0.5">{step2Icon}</span>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">Step 2: Get Verified</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{step2Label}</div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {['Clients', 'Courses', 'Meal Plans'].map(f => (
                                <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full">🔒 {f}</span>
                            ))}
                        </div>
                    </div>
                    {status !== 'PENDING' && (
                        <Button asChild size="sm" className="shrink-0 text-xs h-7">
                            <Link href="/trainer/verification">{step2Btn}</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
