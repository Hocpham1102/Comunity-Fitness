// Client-side helpers that call REST API endpoints
import { createWorkoutSchema, type CreateWorkoutData } from '@/lib/shared/schemas/workout.schema'

export async function apiCreateWorkout(data: CreateWorkoutData) {
  const validated = createWorkoutSchema.parse(data)
  const res = await fetch('/api/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload?.message || 'Failed to create workout')
  }
  return res.json()
}

// Local draft utilities (client-only)
export function saveWorkoutDraft(data: unknown) {
  if (typeof window === 'undefined') return { success: false }
  try {
    localStorage.setItem('workout-draft', JSON.stringify(data))
    return { success: true }
  } catch {
    return { success: false }
  }
}

export function loadWorkoutDraft<T = unknown>() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('workout-draft')
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function clearWorkoutDraft() {
  if (typeof window === 'undefined') return { success: false }
  try {
    localStorage.removeItem('workout-draft')
    return { success: true }
  } catch {
    return { success: false }
  }
}
