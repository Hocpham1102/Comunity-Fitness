import Link from 'next/link'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import ExerciseTable from '@/components/features/exercises/ExerciseTable'

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

async function fetchExercises() {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const res = await fetch(`${base}/api/exercises`, { cache: 'no-store' })
  if (!res.ok) return { items: [], total: 0, page: 1, pageSize: 20 }
  return res.json()
}

export default async function ExercisesPage() {
  const data = await fetchExercises()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button asChild>
          <Link href="/exercises/new">New Exercise</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ExerciseTable items={data.items} />
      </Suspense>
    </div>
  )
}


