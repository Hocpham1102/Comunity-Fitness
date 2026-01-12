import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dumbbell, Clock, ArrowLeft, Play, Target, Zap, Edit } from 'lucide-react'
import Link from 'next/link'

async function getBaseUrl() {
    const hdrs = await headers()
    const host = hdrs.get('host')
    const proto = hdrs.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
}

interface WorkoutDetailsPageProps {
    params: Promise<{ id: string }>
}

export default async function WorkoutDetailsPage({ params }: WorkoutDetailsPageProps) {
    const { id } = await params
    const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
    const hdrs = await headers()

    // Fetch workout details
    const resp = await fetch(`${base}/api/workouts/${id}`, {
        cache: 'no-store',
        headers: {
            cookie: hdrs.get('cookie') ?? '',
        },
    })

    if (!resp.ok) {
        notFound()
    }

    const workout = await resp.json()

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Back Button */}
                <Link href="/workouts" className="inline-block mb-6">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Workouts
                    </Button>
                </Link>

                {/* Main Content Card */}
                <Card className="overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8">
                        <div className="flex flex-col gap-4">
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-sm">
                                    {workout.isTemplate ? 'Template' : 'Custom'}
                                </Badge>
                                {workout.difficulty && (
                                    <Badge
                                        variant="outline"
                                        className={(() => {
                                            if (workout.difficulty === 'BEGINNER') return 'border-green-500 text-green-600 bg-green-50'
                                            if (workout.difficulty === 'INTERMEDIATE') return 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                            if (workout.difficulty === 'ADVANCED') return 'border-orange-500 text-orange-600 bg-orange-50'
                                            return 'border-red-500 text-red-600 bg-red-50'
                                        })()}
                                    >
                                        <Target className="w-3 h-3 mr-1" />
                                        {workout.difficulty}
                                    </Badge>
                                )}
                            </div>

                            {/* Title & Description */}
                            <div>
                                <h1 className="text-4xl font-bold mb-3">{workout.name}</h1>
                                {workout.description && (
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {workout.description}
                                    </p>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-6 mt-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">{workout.estimatedTime ?? 0} min</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Dumbbell className="w-5 h-5" />
                                    <span className="font-medium">{workout.exercises?.length ?? 0} exercises</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-3">
                                <Button size="lg" asChild className="gap-2">
                                    <Link href={`/workouts/${id}/start`}>
                                        <Play className="w-5 h-5" />
                                        Start Workout
                                    </Link>
                                </Button>

                                {/* Edit button - only for Custom workouts */}
                                {!workout.isTemplate && (
                                    <Button size="lg" variant="outline" asChild className="gap-2">
                                        <Link href={`/workouts/edit/${id}`}>
                                            <Edit className="w-5 h-5" />
                                            Edit Workout
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Exercises Section */}
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">Exercise Routine</h2>
                            <p className="text-muted-foreground">
                                Complete these exercises in order for the best results
                            </p>
                        </div>

                        {workout.exercises && workout.exercises.length > 0 ? (
                            <div className="space-y-4">
                                {workout.exercises.map((workoutExercise: any, index: number) => (
                                    <Card key={workoutExercise.id} className="border-l-4 border-l-primary/50">
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                {/* Exercise Number */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-xl font-bold text-primary">{index + 1}</span>
                                                    </div>
                                                </div>

                                                {/* Exercise Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-semibold mb-2">
                                                        {workoutExercise.exercise?.name || 'Exercise'}
                                                    </h3>

                                                    {workoutExercise.exercise?.description && (
                                                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                                            {workoutExercise.exercise.description}
                                                        </p>
                                                    )}

                                                    {/* Exercise Parameters */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Sets</div>
                                                            <div className="text-lg font-bold">{workoutExercise.sets}</div>
                                                        </div>

                                                        {workoutExercise.reps && (
                                                            <div>
                                                                <div className="text-xs text-muted-foreground mb-1">Reps</div>
                                                                <div className="text-lg font-bold">{workoutExercise.reps}</div>
                                                            </div>
                                                        )}

                                                        {workoutExercise.duration && (
                                                            <div>
                                                                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                                                                <div className="text-lg font-bold">{workoutExercise.duration}s</div>
                                                            </div>
                                                        )}

                                                        {workoutExercise.rest && (
                                                            <div>
                                                                <div className="text-xs text-muted-foreground mb-1">Rest</div>
                                                                <div className="text-lg font-bold">{workoutExercise.rest}s</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Notes */}
                                                    {workoutExercise.notes && (
                                                        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                                                            <div className="flex items-start gap-2">
                                                                <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                <p className="text-sm text-blue-900">
                                                                    <span className="font-medium">Tip:</span> {workoutExercise.notes}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Dumbbell className="w-12 h-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground text-center">
                                        No exercises added to this workout yet.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
