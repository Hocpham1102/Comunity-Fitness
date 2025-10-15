'use client'

import ExerciseForm, { type ExerciseFormValues } from '@/components/features/exercises/ExerciseForm'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Props {
  readonly id: string
  readonly defaultValues: Partial<ExerciseFormValues>
}

export default function ExerciseEditClient({ id, defaultValues }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const submit = async (values: ExerciseFormValues) => {
    const res = await fetch(`/api/exercises/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      toast({ title: 'Update failed', description: payload?.message ?? 'Invalid data', variant: 'destructive' })
      return
    }
    toast({ title: 'Exercise updated' })
    router.push('/exercises')
  }

  return <ExerciseForm defaultValues={defaultValues} onSubmit={submit} submitLabel="Save changes" />
}


