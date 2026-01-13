import { db } from '@/lib/server/db/prisma'
import { MuscleGroup, EquipmentType, DifficultyLevel } from '@prisma/client'

export interface ExerciseSearchParams {
  q?: string
  muscleGroups?: MuscleGroup[]
  equipment?: EquipmentType[]
  difficulty?: DifficultyLevel
  page?: number
  pageSize?: number
}

export interface ExerciseSearchResult {
  id: string
  name: string
  description: string | null
  muscleGroups: MuscleGroup[]
  equipment: EquipmentType[]
  difficulty: DifficultyLevel
  videoUrl: string | null
  thumbnailUrl: string | null
}

export async function searchExercises(params: ExerciseSearchParams) {
  const {
    q,
    muscleGroups = [],
    equipment = [],
    difficulty,
    page = 1,
    pageSize = 20,
  } = params

  const skip = (page - 1) * pageSize

  const where: any = {
    isPublic: true,
  }

  // Text search
  if (q) {
    where.name = {
      contains: q,
      mode: 'insensitive',
    }
  }

  // Muscle groups filter
  if (muscleGroups.length > 0) {
    where.muscleGroups = {
      hasSome: muscleGroups,
    }
  }

  // Equipment filter
  if (equipment.length > 0) {
    where.equipment = {
      hasSome: equipment,
    }
  }

  // Difficulty filter
  if (difficulty) {
    where.difficulty = difficulty
  }

  const [exercises, total] = await Promise.all([
    db.exercise.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        muscleGroups: true,
        equipment: true,
        difficulty: true,
        videoUrl: true,
        thumbnailUrl: true,
      },
      skip,
      take: pageSize,
      orderBy: {
        name: 'asc',
      },
    }),
    db.exercise.count({ where }),
  ])

  return {
    items: exercises,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export interface CreateExerciseData {
  name: string
  description?: string | null
  instructions?: string | null
  muscleGroups: MuscleGroup[]
  equipment: EquipmentType[]
  difficulty: DifficultyLevel
  videoUrl?: string | null
  thumbnailUrl?: string | null
}

export async function createExercise(data: CreateExerciseData) {
  return db.exercise.create({
    data,
  })
}

export async function updateExercise(id: string, data: Partial<CreateExerciseData>) {
  return db.exercise.update({
    where: { id },
    data,
  })
}

export async function deleteExercise(id: string) {
  return db.exercise.delete({
    where: { id },
  })
}

export async function getExerciseById(id: string) {
  return db.exercise.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      instructions: true,
      muscleGroups: true,
      equipment: true,
      difficulty: true,
      videoUrl: true,
      thumbnailUrl: true,
    },
  })
}