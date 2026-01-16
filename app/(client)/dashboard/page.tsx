import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/auth'
import { getNutritionStats } from '@/lib/server/services/nutrition-logs.service'
import { getDashboardStats } from '@/lib/server/services/dashboard.service'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default async function DashboardPage() {
  const session = await auth()

  // Fetch dashboard stats
  let dashboardStats = {
    workouts: { total: 0, change: 0 },
    calories: { total: 0, change: 0 },
    weight: { current: null as number | null, change: null as number | null, unit: 'kg' },
    streak: { days: 0, message: 'Start your first workout!' },
    recentWorkouts: [] as Array<{ id: string; title: string; duration: number | null; startedAt: Date }>,
  }

  // Fetch today's nutrition stats
  let nutritionStats = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  }

  if (session?.user?.id) {
    try {
      const [stats, nutrition] = await Promise.all([
        getDashboardStats(session.user.id),
        getNutritionStats(session.user.id),
      ])
      dashboardStats = stats
      nutritionStats = nutrition
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const nutritionGoals = {
    calories: 2200,
    protein: 165,
    carbs: 275,
    fats: 73,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your fitness journey.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.workouts.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.workouts.change > 0 ? '+' : ''}{dashboardStats.workouts.change}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calories Burned Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.calories.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.calories.change > 0 ? '+' : ''}{dashboardStats.calories.change} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.weight.current ? `${dashboardStats.weight.current} kg` : 'Not tracked'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.weight.change !== null
                ? `${dashboardStats.weight.change > 0 ? '+' : ''}${dashboardStats.weight.change} kg from last month`
                : 'No previous data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.streak.days} days</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.streak.message}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>
              Your latest training sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentWorkouts.length > 0 ? (
                dashboardStats.recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {workout.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {workout.duration ? `${workout.duration} minutes • ` : ''}
                        {formatDistanceToNow(new Date(workout.startedAt), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No workouts yet. Start your first workout to see it here!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition Summary</CardTitle>
            <CardDescription>
              Today's calorie and macro intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm">{nutritionStats.totalCalories.toFixed(0)} / {nutritionGoals.calories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm">{nutritionStats.totalProtein.toFixed(0)}g / {nutritionGoals.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm">{nutritionStats.totalCarbs.toFixed(0)}g / {nutritionGoals.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Fats</span>
                <span className="text-sm">{nutritionStats.totalFats.toFixed(0)}g / {nutritionGoals.fats}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
