import { ExerciseForm } from '@/components/admin/exercises/ExerciseForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function NewExercisePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Exercise</h1>
                <p className="text-muted-foreground">
                    Add a new exercise to the database with video instructions
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exercise Details</CardTitle>
                    <CardDescription>
                        Fill in the details for the new exercise
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExerciseForm />
                </CardContent>
            </Card>
        </div>
    )
}
