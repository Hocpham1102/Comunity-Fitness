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

async function fetchWorkoutLog(logId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const cookieHeader = (await cookies()).toString()

  const res = await fetch(`${base}/api/workout-logs/${logId}`, {
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

export default async function ActiveWorkoutPage({
  params,
  searchParams
}: {
  readonly params: Promise<{ readonly id: string }>
  readonly searchParams: Promise<{ readonly logId?: string }>
}) {
  const { id } = await params
  const { logId } = await searchParams
  const workout = await fetchWorkout(id)

  if (!workout) {
    redirect('/workouts')
  }

  // Resume existing log or create new one
  let workoutLog
  if (logId) {
    workoutLog = await fetchWorkoutLog(logId)
    // Verify the log belongs to this workout
    if (!workoutLog || workoutLog.workoutId !== id) {
      // Invalid log ID or mismatch, create new
      workoutLog = await createOrGetWorkoutLog(id, workout.name)
    }
  } else {
    workoutLog = await createOrGetWorkoutLog(id, workout.name)
  }

  if (!workoutLog) {
    redirect('/workouts')
  }

  return (
    <div className="h-full w-full bg-black text-white">
      <VirtualGym workoutLog={workoutLog} />
    </div>
  )
}
