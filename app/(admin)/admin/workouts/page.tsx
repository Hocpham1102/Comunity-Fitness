import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import { headers } from 'next/headers'
import AdminDeleteWorkoutButton from '@/components/admin/AdminDeleteWorkoutButton'
import TogglePublicButton from '@/components/admin/TogglePublicButton'

async function getBaseUrl() {
    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
}

async function fetchWorkouts() {
    const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
    const hdrs = await headers()

    const res = await fetch(`${base}/api/workouts?pageSize=50&isTemplate=true`, {
        cache: 'no-store',
        headers: {
            cookie: hdrs.get('cookie') ?? '',
        },
    })

    if (!res.ok) return { items: [], total: 0 }
    return res.json()
}

export default async function AdminWorkoutsPage() {
    const data = await fetchWorkouts()
    const workouts = Array.isArray(data?.items) ? data.items : []

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER':
                return 'bg-green-100 text-green-800'
            case 'INTERMEDIATE':
                return 'bg-yellow-100 text-yellow-800'
            case 'ADVANCED':
                return 'bg-orange-100 text-orange-800'
            case 'EXPERT':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workout Templates</h1>
                    <p className="text-muted-foreground">
                        Manage workout templates for users
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/workouts/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Templates</CardTitle>
                    <CardDescription>
                        Total: {data.total || 0} workout templates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search workouts..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left text-sm font-medium">Name</th>
                                    <th className="p-3 text-left text-sm font-medium">Difficulty</th>
                                    <th className="p-3 text-left text-sm font-medium">Duration</th>
                                    <th className="p-3 text-left text-sm font-medium">Exercises</th>
                                    <th className="p-3 text-left text-sm font-medium">Public</th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No workout templates found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    workouts.map((workout: any) => (
                                        <tr key={workout.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 text-sm font-medium">{workout.name}</td>
                                            <td className="p-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                                                    {workout.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {workout.estimatedTime || 0} min
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {workout._count?.exercises || 0}
                                            </td>
                                            <td className="p-3 text-sm">
                                                <Badge variant={workout.isPublic ? 'default' : 'secondary'}>
                                                    {workout.isPublic ? 'Public' : 'Private'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/workouts/${workout.id}/edit`}>
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <TogglePublicButton
                                                        workoutId={workout.id}
                                                        workoutName={workout.name}
                                                        isPublic={workout.isPublic}
                                                    />
                                                    <AdminDeleteWorkoutButton
                                                        workoutId={workout.id}
                                                        workoutName={workout.name}
                                                    />
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
