import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Clock, Calendar, ArrowLeft, Weight } from "lucide-react"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

async function getBaseUrl() {
    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
}

interface WorkoutSessionPageProps {
    params: Promise<{ id: string }>
}

export default async function WorkoutSessionPage({ params }: WorkoutSessionPageProps) {
    const { id } = await params
    const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
    const hdrs = await headers()

    // Fetch workout log details
    const resp = await fetch(`${base}/api/workout-logs/${id}`, {
        cache: 'no-store',
        headers: {
            cookie: hdrs.get('cookie') ?? '',
        },
    })

    if (!resp.ok) {
        notFound()
    }

    const workoutLog = await resp.json()

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Calculate total volume
    const totalVolume = workoutLog.exerciseLogs?.reduce((total: number, exerciseLog: any) => {
        return total + exerciseLog.sets.reduce((setTotal: number, set: any) => {
            return setTotal + ((set.weight || 0) * (set.reps || 0))
        }, 0)
    }, 0) || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/workouts">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{workoutLog.title}</h1>
                    <p className="text-muted-foreground">Workout Session Details</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Date</div>
                                <div className="font-semibold">
                                    {new Date(workoutLog.startedAt).toLocaleDateString()}
                                </div>
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
                                <div className="text-sm text-muted-foreground">Duration</div>
                                <div className="font-semibold">
                                    {workoutLog.duration ? `${workoutLog.duration} min` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Exercises</div>
                                <div className="font-semibold">
                                    {workoutLog.exerciseLogs?.length || 0}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Weight className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Volume</div>
                                <div className="font-semibold">
                                    {totalVolume.toFixed(0)} kg
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Workout Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Workout Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Started At</div>
                        <div>{formatDate(workoutLog.startedAt)}</div>
                    </div>
                    {workoutLog.completedAt && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Completed At</div>
                            <div>{formatDate(workoutLog.completedAt)}</div>
                        </div>
                    )}
                    {workoutLog.workout && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Template</div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/workouts/${workoutLog.workout.id}`}
                                    className="text-primary hover:underline"
                                >
                                    {workoutLog.workout.name}
                                </Link>
                                {workoutLog.workout.difficulty && (
                                    <Badge
                                        variant="outline"
                                        className={(() => {
                                            if (workoutLog.workout.difficulty === 'BEGINNER') return 'border-green-500 text-green-600'
                                            if (workoutLog.workout.difficulty === 'INTERMEDIATE') return 'border-yellow-500 text-yellow-600'
                                            if (workoutLog.workout.difficulty === 'ADVANCED') return 'border-orange-500 text-orange-600'
                                            return 'border-red-500 text-red-600'
                                        })()}
                                    >
                                        {workoutLog.workout.difficulty}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                    {workoutLog.notes && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                            <div className="text-sm bg-muted p-3 rounded-lg">{workoutLog.notes}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Exercises Performed */}
            <Card>
                <CardHeader>
                    <CardTitle>Exercises Performed</CardTitle>
                </CardHeader>
                <CardContent>
                    {!workoutLog.exerciseLogs || workoutLog.exerciseLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No exercises logged for this workout.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {workoutLog.exerciseLogs.map((exerciseLog: any, index: number) => (
                                <div key={exerciseLog.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {index + 1}. {exerciseLog.exercise.name}
                                            </h3>
                                            {exerciseLog.exercise.muscleGroups && exerciseLog.exercise.muscleGroups.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {exerciseLog.exercise.muscleGroups.map((muscle: string) => (
                                                        <Badge key={muscle} variant="secondary" className="text-xs">
                                                            {muscle.replace('_', ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sets Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 px-3">Set</th>
                                                    <th className="text-left py-2 px-3">Reps</th>
                                                    <th className="text-left py-2 px-3">Weight (kg)</th>
                                                    <th className="text-left py-2 px-3">Duration (s)</th>
                                                    <th className="text-left py-2 px-3">Distance (km)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exerciseLog.sets.map((set: any) => (
                                                    <tr key={set.id} className="border-b last:border-b-0">
                                                        <td className="py-2 px-3">{set.setNumber}</td>
                                                        <td className="py-2 px-3">{set.reps || '-'}</td>
                                                        <td className="py-2 px-3">{set.weight || '-'}</td>
                                                        <td className="py-2 px-3">{set.duration || '-'}</td>
                                                        <td className="py-2 px-3">{set.distance || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {exerciseLog.notes && (
                                        <div className="mt-3 text-sm bg-muted p-3 rounded-lg">
                                            <span className="font-medium">Notes: </span>
                                            {exerciseLog.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
