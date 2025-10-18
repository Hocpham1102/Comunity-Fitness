import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VirtualGym from '@/components/features/workouts/VirtualGym'

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
  })
  if (!res.ok) return null
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

export default async function ActiveWorkoutPage({ params }: { readonly params: { readonly id: string } }) {
  const { id } = await params
  const workout = await fetchWorkout(id)

  if (!workout) {
    redirect('/workouts')
  }

  // Create workout log for active workout
  const workoutLog = await createOrGetWorkoutLog(id, workout.name)

  if (!workoutLog) {
    redirect('/workouts')
  }

  return (
    <div className="h-full w-full bg-black text-white">
      <VirtualGym workoutLog={workoutLog} />
    </div>
  )
}
