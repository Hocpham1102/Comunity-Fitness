import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dumbbell, Clock, Flame, Search, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"

export default function WorkoutsPage() {
  const workoutTemplates = [
    {
      id: 1,
      name: "Upper Body Strength",
      description: "Build muscle and strength in your chest, back, and arms",
      duration: 45,
      exercises: 8,
      difficulty: "Intermediate",
      calories: 350,
      category: "Strength",
    },
    {
      id: 2,
      name: "Leg Day Blast",
      description: "Comprehensive lower body workout for power and size",
      duration: 60,
      exercises: 10,
      difficulty: "Advanced",
      calories: 450,
      category: "Strength",
    },
    {
      id: 3,
      name: "HIIT Cardio",
      description: "High-intensity intervals to burn fat and boost endurance",
      duration: 30,
      exercises: 6,
      difficulty: "Intermediate",
      calories: 400,
      category: "Cardio",
    },
    {
      id: 4,
      name: "Core & Abs",
      description: "Targeted core workout for a strong, defined midsection",
      duration: 25,
      exercises: 8,
      difficulty: "Beginner",
      calories: 200,
      category: "Core",
    },
    {
      id: 5,
      name: "Full Body Circuit",
      description: "Complete workout hitting all major muscle groups",
      duration: 50,
      exercises: 12,
      difficulty: "Intermediate",
      calories: 500,
      category: "Full Body",
    },
    {
      id: 6,
      name: "Yoga Flow",
      description: "Flexibility and mindfulness practice for recovery",
      duration: 40,
      exercises: 15,
      difficulty: "Beginner",
      calories: 150,
      category: "Flexibility",
    },
  ]

  const recentWorkouts = [
    { date: "Today", name: "Upper Body Strength", duration: 45, calories: 350 },
    { date: "Yesterday", name: "Leg Day Blast", duration: 60, calories: 450 },
    { date: "2 days ago", name: "HIIT Cardio", duration: 30, calories: 400 },
  ]

  return (
    <DashboardLayout>
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
            {workoutTemplates.map((workout) => (
              <Card key={workout.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{workout.category}</Badge>
                    <Badge
                      variant="outline"
                      className={
                        workout.difficulty === "Beginner"
                          ? "border-secondary text-secondary"
                          : workout.difficulty === "Intermediate"
                            ? "border-accent text-accent"
                            : "border-primary text-primary"
                      }
                    >
                      {workout.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{workout.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{workout.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Dumbbell className="w-4 h-4" />
                      <span>{workout.exercises} exercises</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="w-4 h-4" />
                      <span>{workout.calories} cal</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href={`/workouts/${workout.id}/start`}>Start Workout</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/workouts/${workout.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
