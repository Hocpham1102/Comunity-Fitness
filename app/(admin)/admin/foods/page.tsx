import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { headers } from 'next/headers'

async function getBaseUrl() {
    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
}

async function fetchFoods() {
    const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
    const hdrs = await headers()

    const res = await fetch(`${base}/api/foods?pageSize=50`, {
        cache: 'no-store',
        headers: {
            cookie: hdrs.get('cookie') ?? '',
        },
    })

    if (!res.ok) return { items: [], total: 0 }
    return res.json()
}

export default async function AdminFoodsPage() {
    const data = await fetchFoods()
    const foods = Array.isArray(data?.items) ? data.items : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Food Database</h1>
                    <p className="text-muted-foreground">
                        Manage food items and nutritional information
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Food
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Foods</CardTitle>
                    <CardDescription>
                        Total: {data.total || 0} food items
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search foods..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left text-sm font-medium">Name</th>
                                    <th className="p-3 text-left text-sm font-medium">Calories</th>
                                    <th className="p-3 text-left text-sm font-medium">Protein</th>
                                    <th className="p-3 text-left text-sm font-medium">Carbs</th>
                                    <th className="p-3 text-left text-sm font-medium">Fats</th>
                                    <th className="p-3 text-left text-sm font-medium">Public</th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foods.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No food items found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    foods.map((food: any) => (
                                        <tr key={food.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 text-sm font-medium">{food.name}</td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {food.calories.toFixed(0)} kcal
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {food.protein.toFixed(1)}g
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {food.carbs.toFixed(1)}g
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {food.fats.toFixed(1)}g
                                            </td>
                                            <td className="p-3 text-sm">
                                                <Badge variant={food.isPublic ? 'default' : 'secondary'}>
                                                    {food.isPublic ? 'Public' : 'Private'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                    <Button variant="destructive" size="sm">
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
