import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Apple, Flame, Target, Plus, TrendingUp, Utensils } from "lucide-react"
import Link from "next/link"

export default function NutritionPage() {
  const dailyGoals = {
    calories: { consumed: 1850, target: 2200 },
    protein: { consumed: 145, target: 180 },
    carbs: { consumed: 185, target: 220 },
    fats: { consumed: 62, target: 75 },
  }

  const todaysMeals = [
    {
      id: 1,
      type: "Breakfast",
      time: "8:00 AM",
      name: "Oatmeal with Berries & Protein",
      calories: 450,
      protein: 35,
      carbs: 55,
      fats: 12,
    },
    {
      id: 2,
      type: "Snack",
      time: "10:30 AM",
      name: "Greek Yogurt & Almonds",
      calories: 250,
      protein: 20,
      carbs: 15,
      fats: 15,
    },
    {
      id: 3,
      type: "Lunch",
      time: "1:00 PM",
      name: "Grilled Chicken Salad",
      calories: 550,
      protein: 50,
      carbs: 45,
      fats: 18,
    },
    {
      id: 4,
      type: "Snack",
      time: "4:00 PM",
      name: "Protein Shake",
      calories: 200,
      protein: 30,
      carbs: 20,
      fats: 5,
    },
  ]

  const upcomingMeals = [
    {
      id: 5,
      type: "Dinner",
      time: "7:00 PM",
      name: "Salmon with Sweet Potato & Broccoli",
      calories: 600,
      protein: 55,
      carbs: 50,
      fats: 22,
    },
  ]

  const mealIdeas = [
    {
      id: 1,
      name: "High-Protein Breakfast Bowl",
      calories: 480,
      protein: 42,
      prepTime: 15,
      tags: ["High Protein", "Quick"],
    },
    {
      id: 2,
      name: "Mediterranean Chicken Wrap",
      calories: 520,
      protein: 45,
      prepTime: 20,
      tags: ["Balanced", "Portable"],
    },
    {
      id: 3,
      name: "Beef Stir-Fry with Rice",
      calories: 650,
      protein: 52,
      prepTime: 25,
      tags: ["High Protein", "Dinner"],
    },
    {
      id: 4,
      name: "Veggie Quinoa Buddha Bowl",
      calories: 420,
      protein: 18,
      prepTime: 20,
      tags: ["Vegetarian", "Balanced"],
    },
  ]

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
            <p className="text-muted-foreground">Track your meals and hit your macro goals</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/nutrition/log">
              <Plus className="w-5 h-5 mr-2" />
              Log Meal
            </Link>
          </Button>
        </div>

        {/* Daily Goals Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Daily Macros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Calories</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.calories.consumed} / {dailyGoals.calories.target} cal
                  </span>
                </div>
                <Progress value={(dailyGoals.calories.consumed / dailyGoals.calories.target) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.protein.consumed}g / {dailyGoals.protein.target}g
                  </span>
                </div>
                <Progress value={(dailyGoals.protein.consumed / dailyGoals.protein.target) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.carbs.consumed}g / {dailyGoals.carbs.target}g
                  </span>
                </div>
                <Progress value={(dailyGoals.carbs.consumed / dailyGoals.carbs.target) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fats</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals.fats.consumed}g / {dailyGoals.fats.target}g
                  </span>
                </div>
                <Progress value={(dailyGoals.fats.consumed / dailyGoals.fats.target) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Macro Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Protein</div>
                    <div className="text-2xl font-bold text-primary">{dailyGoals.protein.consumed}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-lg font-semibold">{dailyGoals.protein.target}g</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Carbs</div>
                    <div className="text-2xl font-bold text-secondary">{dailyGoals.carbs.consumed}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-lg font-semibold">{dailyGoals.carbs.target}g</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Fats</div>
                    <div className="text-2xl font-bold text-accent">{dailyGoals.fats.consumed}g</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                    <div className="text-lg font-semibold">{dailyGoals.fats.target}g</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-secondary" />
                Today's Meals
              </CardTitle>
              <Badge variant="secondary">{todaysMeals.length} meals logged</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysMeals.map((meal) => (
                <div key={meal.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {meal.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{meal.time}</span>
                      </div>
                      <div className="font-semibold">{meal.name}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{meal.calories} cal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                </div>
              ))}

              {upcomingMeals.map((meal) => (
                <div key={meal.id} className="p-4 rounded-lg border border-dashed bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {meal.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{meal.time}</span>
                      </div>
                      <div className="font-semibold">{meal.name}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      Log Meal
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{meal.calories} cal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meal Ideas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Meal Ideas</h2>
            <Button variant="outline" asChild>
              <Link href="/nutrition/recipes">
                Browse All <TrendingUp className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealIdeas.map((meal) => (
              <Card key={meal.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                    <Utensils className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{meal.name}</h3>
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <span>{meal.calories} cal</span>
                    <span>•</span>
                    <span>{meal.protein}g protein</span>
                    <span>•</span>
                    <span>{meal.prepTime} min</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {meal.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-transparent" size="sm" variant="outline">
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
  )
}
