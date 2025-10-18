import { headers, cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import WorkoutTemplateCard from '@/components/features/workouts/WorkoutTemplateCard'

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

async function fetchWorkout(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${base}/api/workouts/${id}`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchTemplates() {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${base}/api/workouts?mine=true&pageSize=12`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  })
  if (!res.ok) return { items: [] }
  return res.json()
}

async function createOrGetWorkoutLog(workoutId: string, workoutName: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const cookieHeader = (await cookies()).toString()
  
  // Try to create a new workout log
  const res = await fetch(`${base}/api/workout-logs`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      cookie: cookieHeader,
    },
    body: JSON.stringify({
      workoutId,
      title: workoutName,
    }),
  })
  
  if (!res.ok) return null
  return res.json()
}

export default async function WorkoutStartPage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
  const { id } = await params
  const [workout, templatesResp] = await Promise.all([
    fetchWorkout(id),
    fetchTemplates(),
  ])

  const templates = Array.isArray(templatesResp?.items) ? templatesResp.items : []

  if (!workout) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
          <Button asChild>
            <Link href="/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Create workout log for active workout
  const workoutLog = await createOrGetWorkoutLog(id, workout.name)

  if (!workoutLog) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to start workout</h1>
          <Button asChild>
            <Link href="/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            {workout.difficulty && (
              <Badge variant="secondary">{workout.difficulty}</Badge>
            )}
            {typeof workout.estimatedTime === 'number' && (
              <span>{workout.estimatedTime} min</span>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/workouts">Back to Workouts</Link>
        </Button>
      </div>

      {/* Enter Virtual Gym Button */}
      <div className="text-center">
        <Button 
          size="lg" 
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg"
          asChild
        >
          <Link href={`/workout/${id}/active`}>
            🏋️ Enter Virtual Gym
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Full-screen immersive workout experience
        </p>
      </div>

      {/* Templates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Other Templates</h2>
          <span className="text-sm text-muted-foreground">{templates.length} templates</span>
        </div>

        {templates.length === 0 ? (
          <div className="text-sm text-muted-foreground">No templates found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((t: any) => (
              <WorkoutTemplateCard
                key={t.id}
                id={t.id}
                name={t.name}
                difficulty={t.difficulty}
                estimatedTime={t.estimatedTime}
                exercisesCount={t._count?.exercises}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}


