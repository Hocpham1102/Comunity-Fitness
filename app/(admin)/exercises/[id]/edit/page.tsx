import ExerciseEditClient from '@/components/features/exercises/ExerciseEditClient'
import { headers } from 'next/headers'

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

async function fetchExercise(id: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await getBaseUrl())
  const res = await fetch(`${base}/api/exercises/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function EditExercisePage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
  const { id } = await params
  const data = await fetchExercise(id)
  // Client submit handler is embedded inside a Client Component pattern; simplified here as server page returning form with defaultValues
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Exercise</h1>
      <ExerciseEditClient id={id} defaultValues={data ?? {}} />
    </div>
  )
}

