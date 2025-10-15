import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { listExercises, createExercise } from '@/lib/server/services/exercises.service'
import { exerciseSchema } from '@/lib/shared/schemas/workout.schema'

const createExerciseSchema = exerciseSchema.pick({
  id: true,
  name: true,
  description: true,
  instructions: true,
  muscleGroups: true,
  equipment: true,
  difficulty: true,
  videoUrl: true,
  thumbnailUrl: true,
  isPublic: true,
}).omit({ id: true })

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  query: z.string().optional(),
  difficulty: z.string().optional(),
  muscleGroups: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? [v] : v)),
  equipment: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? [v] : v)),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = listQuerySchema.parse(Object.fromEntries(searchParams.entries()))

    const result = await listExercises({
      page: parsed.page,
      pageSize: parsed.pageSize,
      query: parsed.query,
      difficulty: parsed.difficulty,
      muscleGroups: parsed.muscleGroups,
      equipment: parsed.equipment,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid query', errors: error.issues }, { status: 400 })
    }
    console.error('List exercises error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createExerciseSchema.parse(body)

    const created = await createExercise({ id: session.user.id, role: session.user.role }, data)

    revalidateTag('exercises')
    revalidateTag(`exercise:${created.id}`)

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input data', errors: error.issues }, { status: 400 })
    }
    console.error('Create exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


