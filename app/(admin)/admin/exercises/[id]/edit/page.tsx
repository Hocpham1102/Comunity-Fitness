import { ExerciseForm } from '@/components/admin/exercises/ExerciseForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getExerciseById } from '@/lib/server/services/exercises.service'
import { notFound } from 'next/navigation'

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const exercise = await getExerciseById(id)

    if (!exercise) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Exercise</h1>
                <p className="text-muted-foreground">
                    Update exercise details and video instructions
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exercise Details</CardTitle>
                    <CardDescription>
                        Update the information for {exercise.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExerciseForm initialData={{
                        id: exercise.id,
                        name: exercise.name,
                        description: exercise.description,
                        instructions: exercise.instructions,
                        muscleGroups: exercise.muscleGroups,
                        equipment: exercise.equipment,
                        difficulty: exercise.difficulty,
                        videoUrl: exercise.videoUrl,
                        thumbnailUrl: exercise.thumbnailUrl
                    }} />
                </CardContent>
            </Card>
        </div>
    )
}
