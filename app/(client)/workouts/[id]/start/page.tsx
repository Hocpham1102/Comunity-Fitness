'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import WorkoutTemplateCard from '@/components/features/workouts/WorkoutTemplateCard'
import ResumeWorkoutDialog from '@/components/features/workouts/ResumeWorkoutDialog'

interface Params {
  id: string
}

export default function WorkoutStartPage({ params }: { params: Promise<Params> }) {
  const router = useRouter()
  const [workoutId, setWorkoutId] = useState<string>('')
  const [workout, setWorkout] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [existingLog, setExistingLog] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setWorkoutId(p.id))
  }, [params])

  useEffect(() => {
    if (!workoutId) return

    async function loadData() {
      try {
        // Fetch workout
        const workoutRes = await fetch(`/api/workouts/${workoutId}`)
        if (!workoutRes.ok) {
          setWorkout(null)
          setIsLoading(false)
          return
        }
        const workoutData = await workoutRes.json()
        setWorkout(workoutData)

        // Fetch templates
        const templatesRes = await fetch('/api/workouts?mine=true&pageSize=12')
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(Array.isArray(templatesData?.items) ? templatesData.items : [])
        }

        // Check for existing incomplete log
        const logRes = await fetch(`/api/workout-logs/check?workoutId=${workoutId}`)
        if (logRes.ok) {
          const logData = await logRes.json()
          if (logData.existingLog) {
            setExistingLog(logData.existingLog)
            setShowDialog(true)
          }
        }
      } catch (error) {
        console.error('Failed to load workout:', error)
        toast.error('Failed to load workout')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [workoutId])

  const handleContinue = () => {
    setShowDialog(false)
    router.push(`/workout/${workoutId}/active?logId=${existingLog.id}`)
  }

  const handleStartFresh = async () => {
    setShowDialog(false)
    try {
      const res = await fetch('/api/workout-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId: workoutId,
          title: workout.name,
        }),
      })

      if (!res.ok) throw new Error('Failed to create workout log')

      const newLog = await res.json()
      router.push(`/workout/${workoutId}/active?logId=${newLog.id}`)
    } catch (error) {
      console.error('Failed to start workout:', error)
      toast.error('Failed to start workout')
    }
  }

  const handleEnterGym = () => {
    if (existingLog) {
      router.push(`/workout/${workoutId}/active?logId=${existingLog.id}`)
    } else {
      router.push(`/workout/${workoutId}/active`)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

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

  return (
    <>
      <ResumeWorkoutDialog
        open={showDialog}
        onContinue={handleContinue}
        onStartFresh={handleStartFresh}
        workoutTitle={workout.name}
        lastUpdated={existingLog?.updatedAt || existingLog?.startedAt || new Date().toISOString()}
      />

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
            onClick={handleEnterGym}
          >
            🏋️ Enter Virtual Gym
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
    </>
  )
}
