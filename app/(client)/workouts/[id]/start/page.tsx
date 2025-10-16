import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  const res = await fetch(`${base}/api/workouts/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

async function fetchTemplates() {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const res = await fetch(`${base}/api/workouts?mine=true&pageSize=12`, { cache: 'no-store' })
  if (!res.ok) return { items: [] }
  return res.json()
}

export default async function WorkoutStartPage({ params }: { readonly params: { readonly id: string } }) {
  const [workout, templatesResp] = await Promise.all([
    fetchWorkout(params.id),
    fetchTemplates(),
  ])

  const templates = Array.isArray(templatesResp?.items) ? templatesResp.items : []

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout?.name ?? 'Workout'}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            {workout?.difficulty && (
              <Badge variant="secondary">{workout.difficulty}</Badge>
            )}
            {typeof workout?.estimatedTime === 'number' && (
              <span>{workout.estimatedTime} min</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/workouts">Back</Link>
          </Button>
          <Button>Start Workout</Button>
        </div>
      </div>

      {workout?.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workout.description}</p>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workout Templates</h2>
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


