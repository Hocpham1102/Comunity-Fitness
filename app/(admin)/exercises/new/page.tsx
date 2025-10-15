"use client"

import { useRouter } from 'next/navigation'
import ExerciseForm, { type ExerciseFormValues } from '@/components/features/exercises/ExerciseForm'
import { useToast } from '@/hooks/use-toast'

export default function NewExercisePage() {
  const router = useRouter()
  const { toast } = useToast()

  const submit = async (data: ExerciseFormValues) => {
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      toast({ title: 'Create failed', description: payload?.message ?? 'Invalid data', variant: 'destructive' })
      return
    }
    toast({ title: 'Exercise created' })
    router.push('/exercises')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Exercise</h1>
      <ExerciseForm onSubmit={submit} submitLabel="Create" />
    </div>
  )
}


