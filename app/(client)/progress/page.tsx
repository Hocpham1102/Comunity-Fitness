import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Award, Target, Dumbbell, Flame, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { headers, cookies } from "next/headers"

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

async function fetchWorkoutHistory() {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${base}/api/workout-logs?pageSize=10`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  })
  if (!res.ok) return { items: [] }
  return res.json()
}

async function fetchProgressStats() {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${base}/api/progress/stats`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  })
  if (!res.ok) return null
  return res.json()
}

export default async function ProgressPage() {
  const [historyResp, stats] = await Promise.all([
    fetchWorkoutHistory(),
    fetchProgressStats(),
  ])

  const history = Array.isArray(historyResp?.items) ? historyResp.items : []
  const statsData = stats || {
    totalSessions: 0,
    totalDuration: 0,
    totalVolume: 0,
    averageSessionDuration: 0,
    lastWorkoutDate: null,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-muted-foreground">Track your fitness journey and celebrate your achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statsData.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
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
                <div className="text-2xl font-bold">{formatDuration(statsData.totalDuration)}</div>
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
                <div className="text-2xl font-bold">{Math.round(statsData.totalVolume / 1000)}k</div>
                <div className="text-sm text-muted-foreground">Total Volume (kg)</div>
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
                <div className="text-2xl font-bold">{formatDuration(statsData.averageSessionDuration)}</div>
                <div className="text-sm text-muted-foreground">Avg Session</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
              <p className="text-muted-foreground mb-4">Start your fitness journey by completing your first workout!</p>
              <Button asChild>
                <Link href="/workouts">Browse Workouts</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((workout: any) => (
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
                        {workout.workout?.name && `${workout.workout.name} • `}
                        {formatDate(workout.startedAt)}
                        {workout.duration && ` • ${formatDuration(workout.duration)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {workout.completedAt ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        In Progress
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/workouts/${workout.workoutId}/start`}>
                        {workout.completedAt ? 'View' : 'Continue'}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/workouts">Start New Workout</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/workouts/new">Create Custom Workout</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="font-semibold">First Workout</div>
                  <div className="text-sm text-muted-foreground">
                    {statsData.totalSessions > 0 ? 'Completed!' : 'Complete your first workout'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-2xl">💪</div>
                <div>
                  <div className="font-semibold">10 Workouts</div>
                  <div className="text-sm text-muted-foreground">
                    {statsData.totalSessions >= 10 ? 'Completed!' : `${10 - statsData.totalSessions} more to go`}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-semibold">Consistency</div>
                  <div className="text-sm text-muted-foreground">
                    {statsData.lastWorkoutDate ? 'Keep it up!' : 'Start your streak today'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}