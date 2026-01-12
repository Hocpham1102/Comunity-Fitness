import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Clock, Plus, TrendingUp, Flame } from "lucide-react"
import Link from "next/link"
import { headers } from "next/headers"
import WorkoutFilters from "@/components/features/workouts/WorkoutFilters"
import WorkoutPagination from "@/components/features/workouts/WorkoutPagination"

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

interface WorkoutsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WorkoutsPage({ searchParams }: WorkoutsPageProps) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const hdrs = await headers()
  const params = await searchParams

  // Build query string from search params
  const queryParams = new URLSearchParams()
  queryParams.set('mine', 'true')
  queryParams.set('pageSize', '6') // 6 items per page

  // Pagination
  const currentPage = params.page && typeof params.page === 'string' ? parseInt(params.page) : 1
  queryParams.set('page', currentPage.toString())

  if (params.q && typeof params.q === 'string') {
    queryParams.set('q', params.q)
  }
  if (params.difficulty && typeof params.difficulty === 'string') {
    queryParams.set('difficulty', params.difficulty)
  }
  if (params.estimatedTimeLte && typeof params.estimatedTimeLte === 'string') {
    queryParams.set('estimatedTimeLte', params.estimatedTimeLte)
  }
  if (params.isTemplate && typeof params.isTemplate === 'string') {
    queryParams.set('isTemplate', params.isTemplate)
  }

  // Fetch templates that are public or created by current user
  const resp = await fetch(`${base}/api/workouts?${queryParams.toString()}`, {
    cache: 'no-store',
    headers: {
      cookie: hdrs.get('cookie') ?? '',
    },
  })
  const data = resp.ok ? await resp.json() : { items: [], total: 0, page: 1, pageSize: 6 }
  const workoutTemplates = Array.isArray(data?.items) ? data.items : []
  const totalPages = Math.ceil((data?.total || 0) / (data?.pageSize || 6))

  // Fetch recent workout logs
  const recentResp = await fetch(`${base}/api/workout-logs?pageSize=3`, {
    cache: 'no-store',
    headers: {
      cookie: hdrs.get('cookie') ?? '',
    },
  })
  const recentData = recentResp.ok ? await recentResp.json() : { items: [] }
  const recentWorkouts = Array.isArray(recentData?.items) ? recentData.items : []

  // Fetch workout statistics
  const statsResp = await fetch(`${base}/api/workout-logs/stats`, {
    cache: 'no-store',
    headers: {
      cookie: hdrs.get('cookie') ?? '',
    },
  })
  const stats = statsResp.ok ? await statsResp.json() : {
    thisMonthSessions: 0,
    thisMonthDuration: 0,
    totalVolume: 0,
    percentageChange: 0,
  }

  // Helper function to format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Workouts</h1>
          <p className="text-muted-foreground">Browse workout templates or create your own</p>
        </div>
        <Button size="lg" asChild>
          <Link href="/workouts/new">
            <Plus className="w-5 h-5 mr-2" />
            Create Workout
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.thisMonthSessions || 0}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.thisMonthDuration
                    ? `${Math.floor(stats.thisMonthDuration / 60)}h ${stats.thisMonthDuration % 60}m`
                    : '0h'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalVolume
                    ? stats.totalVolume >= 1000
                      ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                      : stats.totalVolume.toFixed(0)
                    : '0'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Volume (kg)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.percentageChange !== undefined
                    ? `${stats.percentageChange > 0 ? '+' : ''}${stats.percentageChange}%`
                    : '0%'
                  }
                </div>
                <div className="text-sm text-muted-foreground">vs Last Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <WorkoutFilters />

      {/* Workout Templates */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Workout Templates</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutTemplates.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No templates found yet.
              </CardContent>
            </Card>
          ) : workoutTemplates.map((workout: any) => (
            <Card key={workout.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="shrink-0">
                    {workout.isTemplate ? 'Template' : 'Custom'}
                  </Badge>
                  {workout.difficulty && (
                    <Badge
                      variant="outline"
                      className={(() => {
                        if (workout.difficulty === 'BEGINNER') return 'border-green-500 text-green-600'
                        if (workout.difficulty === 'INTERMEDIATE') return 'border-yellow-500 text-yellow-600'
                        if (workout.difficulty === 'ADVANCED') return 'border-orange-500 text-orange-600'
                        return 'border-red-500 text-red-600'
                      })()}
                    >
                      {workout.difficulty}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">{workout.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 pt-4 pb-4">
                {workout.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {workout.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm mt-auto">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{workout.estimatedTime ?? 0} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Dumbbell className="w-4 h-4 shrink-0" />
                    <span>{workout._count?.exercises ?? 0} exercises</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4 pb-4">
                <div className="flex gap-2 w-full">
                  <Button className="flex-1" size="default" asChild>
                    <Link href={`/workouts/${workout.id}/start`}>Start Workout</Link>
                  </Button>
                  <Button variant="outline" size="default" asChild>
                    <Link href={`/workouts/${workout.id}`}>
                      <span className="hidden sm:inline">Details</span>
                      <span className="sm:hidden">Info</span>
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <WorkoutPagination currentPage={currentPage} totalPages={totalPages} />
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent workouts yet. Start your first workout!
            </p>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout: any) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{workout.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {getRelativeTime(workout.startedAt)}
                        {workout.duration && ` • ${workout.duration} min`}
                        {workout._count?.exerciseLogs && ` • ${workout._count.exerciseLogs} exercises`}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/workouts/session/${workout.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
