import { db } from '@/lib/server/db/prisma'
import type { CreateWorkoutData, UpdateWorkoutData } from '@/lib/shared/schemas/workout.schema'

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BadRequestError'
  }
}

export interface ListWorkoutsParams {
  page?: number
  pageSize?: number
  isPublic?: boolean
  mine?: boolean
  q?: string
  difficulty?: string
  estimatedTimeLte?: number
  isTemplate?: boolean
}

export interface AuthUser {
  id: string
  role?: string
}

export async function createWorkout(userId: string, data: CreateWorkoutData, userRole?: string) {
  // Auto-set isTemplate based on user role
  // Only admins can create templates, regular users create custom workouts
  const isTemplate = userRole === 'ADMIN'

  const created = await db.$transaction(async (tx) => {
    const workout = await tx.workout.create({
      data: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime,
        isTemplate, // Use computed value instead of client data
        isPublic: data.isPublic,
        createdById: userId,
      },
    })

    if (data.exercises?.length) {
      // Validate all exerciseIds exist to avoid FK errors
      const exerciseIds = Array.from(new Set(data.exercises.map((e) => e.exerciseId)))
      const found = await tx.exercise.findMany({
        where: { id: { in: exerciseIds } },
        select: { id: true },
      })
      const foundIds = new Set(found.map((e) => e.id))
      const missing = exerciseIds.filter((id) => !foundIds.has(id))
      if (missing.length > 0) {
        throw new BadRequestError(`Invalid exerciseId(s): ${missing.join(', ')}`)
      }

      // Normalize order to provided order field or index
      const ordered = data.exercises
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      await tx.workoutExercise.createMany({
        data: ordered.map((ex, index) => ({
          workoutId: workout.id,
          exerciseId: ex.exerciseId,
          order: ex.order ?? index,
          sets: ex.sets,
          reps: ex.reps ?? null,
          duration: ex.duration ?? null,
          rest: ex.rest ?? null,
          notes: ex.notes ?? null,
        })),
      })
    }

    return tx.workout.findUnique({
      where: { id: workout.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    })
  })

  return created
}

export async function listWorkouts(params: ListWorkoutsParams, user?: AuthUser) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
  const skip = (page - 1) * pageSize

  const where: any = {}

  // Text search
  if (params.q) {
    where.name = {
      contains: params.q,
      mode: 'insensitive',
    }
  }

  // Difficulty filter
  if (params.difficulty) {
    where.difficulty = params.difficulty
  }

  // Time filter
  if (params.estimatedTimeLte) {
    where.estimatedTime = {
      lte: params.estimatedTimeLte,
    }
  }

  // Template filter
  if (params.isTemplate !== undefined) {
    where.isTemplate = params.isTemplate
  }

  if (params.isPublic === true) {
    where.isPublic = true
  }

  if (params.mine && user?.id) {
    // mine=true means include user's own items in addition to public ones
    where.OR = [{ createdById: user.id }, { isPublic: true }]
  } else if (!user?.id) {
    // unauthenticated: only public
    where.isPublic = true
  }

  const [items, total] = await Promise.all([
    db.workout.findMany({
      where,
      include: {
        _count: { select: { exercises: true } },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.workout.count({ where }),
  ])

  return { items, total, page, pageSize }
}

export async function getWorkoutById(id: string, user?: AuthUser) {
  const workout = await db.workout.findUnique({
    where: { id },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
    },
  })

  if (!workout) return null

  if (workout.isPublic) return workout

  if (!user?.id) return null

  if (workout.createdById === user.id || user.role === 'ADMIN') return workout

  return null
}

export async function updateWorkout(id: string, data: UpdateWorkoutData, user: AuthUser) {
  const existing = await db.workout.findUnique({ where: { id } })
  if (!existing) return null

  const isOwner = existing.createdById === user.id
  const isAdmin = user.role === 'ADMIN'

  // Protection: Only admins can edit templates
  if (existing.isTemplate && !isAdmin) {
    return null // Non-admin users cannot edit templates
  }

  // Regular authorization: must be owner or admin
  if (!isOwner && !isAdmin) return null

  const updated = await db.$transaction(async (tx) => {
    await tx.workout.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description ?? undefined,
        difficulty: data.difficulty ?? existing.difficulty,
        estimatedTime: data.estimatedTime ?? existing.estimatedTime ?? undefined,
        // Don't allow changing isTemplate after creation
        isTemplate: existing.isTemplate,
        isPublic: data.isPublic ?? existing.isPublic,
      },
    })

    if (data.exercises) {
      await tx.workoutExercise.deleteMany({ where: { workoutId: id } })
      const ordered = data.exercises
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      if (ordered.length) {
        await tx.workoutExercise.createMany({
          data: ordered.map((ex, index) => ({
            workoutId: id,
            exerciseId: ex.exerciseId,
            order: ex.order ?? index,
            sets: ex.sets,
            reps: ex.reps ?? null,
            duration: ex.duration ?? null,
            rest: ex.rest ?? null,
            notes: ex.notes ?? null,
          })),
        })
      }
    }

    return tx.workout.findUnique({
      where: { id },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
      },
    })
  })

  return updated
}

export async function deleteWorkout(id: string, user: AuthUser) {
  const existing = await db.workout.findUnique({ where: { id } })
  if (!existing) return false

  const isOwner = existing.createdById === user.id
  const isAdmin = user.role === 'ADMIN'
  if (!isOwner && !isAdmin) return false

  await db.workout.delete({ where: { id } })
  return true
}


