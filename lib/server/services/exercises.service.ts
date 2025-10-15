import { db } from '@/lib/server/db/prisma'

export interface ListExercisesParams {
  page?: number
  pageSize?: number
  query?: string
  muscleGroups?: string[]
  equipment?: string[]
  difficulty?: string
}

export interface AuthUser {
  id: string
  role?: string
}

export async function createExercise(_user: AuthUser, data: {
  name: string
  description?: string
  instructions?: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
  videoUrl?: string | null
  thumbnailUrl?: string | null
  isPublic?: boolean
}) {
  const created = await db.exercise.create({
    data: {
      name: data.name,
      description: data.description,
      instructions: data.instructions,
      muscleGroups: data.muscleGroups,
      equipment: data.equipment,
      difficulty: data.difficulty as any,
      videoUrl: data.videoUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      isPublic: data.isPublic ?? true,
    },
  })
  return created
}

export async function listExercises(params: ListExercisesParams) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (params.query) {
    where.name = { contains: params.query, mode: 'insensitive' }
  }
  if (params.muscleGroups && params.muscleGroups.length > 0) {
    where.muscleGroups = { hasSome: params.muscleGroups }
  }
  if (params.equipment && params.equipment.length > 0) {
    where.equipment = { hasSome: params.equipment }
  }
  if (params.difficulty) {
    where.difficulty = params.difficulty as any
  }

  const [items, total] = await Promise.all([
    db.exercise.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
    }),
    db.exercise.count({ where }),
  ])

  return { items, total, page, pageSize }
}

export async function getExerciseById(id: string) {
  return db.exercise.findUnique({ where: { id } })
}

export async function updateExercise(_id: string, _user: AuthUser, data: {
  id: string
  name?: string
  description?: string | null
  instructions?: string | null
  muscleGroups?: string[]
  equipment?: string[]
  difficulty?: string
  videoUrl?: string | null
  thumbnailUrl?: string | null
  isPublic?: boolean
}) {
  const updated = await db.exercise.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      instructions: data.instructions,
      muscleGroups: data.muscleGroups,
      equipment: data.equipment,
      difficulty: (data.difficulty as any) ?? undefined,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      isPublic: data.isPublic,
    },
  })
  return updated
}

export async function deleteExercise(id: string, _user: AuthUser) {
  await db.exercise.delete({ where: { id } })
  return true
}


