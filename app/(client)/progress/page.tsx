"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Award, Target, Dumbbell, Flame } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function ProgressPage() {
  const weightData = [
    { date: "Jan 1", weight: 185 },
    { date: "Jan 8", weight: 183 },
    { date: "Jan 15", weight: 182 },
    { date: "Jan 22", weight: 180 },
    { date: "Jan 29", weight: 179 },
    { date: "Feb 5", weight: 177 },
    { date: "Feb 12", weight: 176 },
  ]

  const workoutVolumeData = [
    { week: "Week 1", volume: 12500 },
    { week: "Week 2", volume: 13200 },
    { week: "Week 3", volume: 14100 },
    { week: "Week 4", volume: 15300 },
    { week: "Week 5", volume: 16200 },
    { week: "Week 6", volume: 17500 },
  ]

  const calorieData = [
    { date: "Mon", consumed: 2100, target: 2200 },
    { date: "Tue", consumed: 2250, target: 2200 },
    { date: "Wed", consumed: 2150, target: 2200 },
    { date: "Thu", consumed: 2180, target: 2200 },
    { date: "Fri", consumed: 2300, target: 2200 },
    { date: "Sat", consumed: 2400, target: 2200 },
    { date: "Sun", consumed: 2050, target: 2200 },
  ]

  const personalRecords = [
    { exercise: "Bench Press", weight: 225, unit: "lbs", date: "Feb 10", improvement: "+15 lbs" },
    { exercise: "Squat", weight: 315, unit: "lbs", date: "Feb 8", improvement: "+25 lbs" },
    { exercise: "Deadlift", weight: 405, unit: "lbs", date: "Feb 5", improvement: "+35 lbs" },
    { exercise: "Overhead Press", weight: 135, unit: "lbs", date: "Feb 12", improvement: "+10 lbs" },
  ]

  const achievements = [
    { title: "7-Day Streak", description: "Logged workouts for 7 consecutive days", icon: "🔥", date: "Feb 12" },
    { title: "First PR", description: "Set your first personal record", icon: "🏆", date: "Feb 5" },
    { title: "Macro Master", description: "Hit your macro goals 5 days in a row", icon: "🎯", date: "Feb 10" },
    { title: "100 Workouts", description: "Completed 100 total workouts", icon: "💪", date: "Feb 8" },
  ]

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-muted-foreground">Visualize your fitness journey and celebrate your wins</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  -9 lbs
                </Badge>
              </div>
              <div className="text-2xl font-bold">176 lbs</div>
              <div className="text-sm text-muted-foreground">Current Weight</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-secondary" />
                </div>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  +40%
                </Badge>
              </div>
              <div className="text-2xl font-bold">17.5k</div>
              <div className="text-sm text-muted-foreground">Weekly Volume</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-accent" />
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  98%
                </Badge>
              </div>
              <div className="text-2xl font-bold">2,165</div>
              <div className="text-sm text-muted-foreground">Avg Calories</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  New!
                </Badge>
              </div>
              <div className="text-2xl font-bold">4</div>
              <div className="text-sm text-muted-foreground">New PRs</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weight Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Weight Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[170, 190]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Workout Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-secondary" />
                Workout Volume Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="volume" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Calorie Adherence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              Weekly Calorie Adherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="consumed" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="Consumed" />
                <Bar dataKey="target" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Personal Records & Achievements */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Personal Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalRecords.map((pr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold">{pr.exercise}</div>
                      <div className="text-sm text-muted-foreground">{pr.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {pr.weight} {pr.unit}
                      </div>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {pr.improvement}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{achievement.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">{achievement.description}</div>
                      <div className="text-xs text-muted-foreground">{achievement.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
