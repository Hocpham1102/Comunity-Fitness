import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dumbbell, Clock, Search, Plus, TrendingUp, Flame } from "lucide-react"
import Link from "next/link"
import { headers } from "next/headers"

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export default async function WorkoutsPage() {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const hdrs = await headers()
  // Fetch templates that are public or created by current user
  const resp = await fetch(`${base}/api/workouts?mine=true&pageSize=12`, {
    cache: 'no-store',
    headers: {
      cookie: hdrs.get('cookie') ?? '',
    },
  })
  const data = resp.ok ? await resp.json() : { items: [] }
  const workoutTemplates = Array.isArray(data?.items) ? data.items : []

  const recentWorkouts = [
    { date: "Today", name: "Upper Body Strength", duration: 45, calories: 350 },
    { date: "Yesterday", name: "Leg Day Blast", duration: 60, calories: 450 },
    { date: "2 days ago", name: "HIIT Cardio", duration: 30, calories: 400 },
  ]

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
                  <div className="text-2xl font-bold">24</div>
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
                  <div className="text-2xl font-bold">18h</div>
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
                  <div className="text-2xl font-bold">8.4k</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
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
                  <div className="text-2xl font-bold">+12%</div>
                  <div className="text-sm text-muted-foreground">vs Last Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search workouts..." className="pl-10" />
        </div>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWorkouts.map((workout, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{workout.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {workout.date} • {workout.duration} min • {workout.calories} cal
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <Card key={workout.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">Template</Badge>
                    <Badge
                      variant="outline"
                      className={workout.difficulty === 'BEGINNER' ? 'border-secondary text-secondary' : workout.difficulty === 'INTERMEDIATE' ? 'border-accent text-accent' : 'border-primary text-primary'}
                    >
                      {workout.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workout.description && (
                    <p className="text-sm text-muted-foreground">{workout.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{workout.estimatedTime ?? 0} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Dumbbell className="w-4 h-4" />
                      <span>{workout._count?.exercises ?? 0} exercises</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1" asChild>
                      <Link href={`/workouts/${workout.id}/start`}>Start Workout</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/workouts/${workout.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
  )
}
