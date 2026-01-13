import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/auth'
import { getNutritionStats } from '@/lib/server/services/nutrition-logs.service'

export default async function DashboardPage() {
  const session = await auth()

  // Fetch today's nutrition stats
  let nutritionStats = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  }

  if (session?.user?.id) {
    try {
      nutritionStats = await getNutritionStats(session.user.id)
    } catch (error) {
      console.error('Error fetching nutrition stats:', error)
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              +180 from yesterday
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
            <div className="text-2xl font-bold">75.2 kg</div>
            <p className="text-xs text-muted-foreground">
              -0.8 kg from last month
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
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up! 🔥
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
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Upper Body Strength
                  </p>
                  <p className="text-sm text-muted-foreground">
                    45 minutes • 2 days ago
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Cardio HIIT
                  </p>
                  <p className="text-sm text-muted-foreground">
                    30 minutes • 3 days ago
                  </p>
                </div>
              </div>
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