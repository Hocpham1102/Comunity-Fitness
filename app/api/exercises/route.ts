import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrNull } from '@/lib/server/auth/session'
import { searchExercises, createExercise } from '@/lib/server/services/exercises.service'
import { MuscleGroup, EquipmentType, DifficultyLevel } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const q = searchParams.get('q') || undefined
    const muscleGroups = searchParams.getAll('muscleGroups') as MuscleGroup[]
    const equipment = searchParams.getAll('equipment') as EquipmentType[]
    const difficulty = searchParams.get('difficulty') as DifficultyLevel | null
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '20')

    // Get session (optional for public exercises)
    const session = await getSessionOrNull()

    const result = await searchExercises({
      q,
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : undefined,
      equipment: equipment.length > 0 ? equipment : undefined,
      difficulty: difficulty || undefined,
      page,
      pageSize,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Search exercises error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrNull()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    // Basic validation
    if (!body.name || !body.muscleGroups || !body.difficulty) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const newExercise = await createExercise({
      name: body.name,
      description: body.description,
      instructions: body.instructions,
      muscleGroups: body.muscleGroups,
      equipment: body.equipment || [],
      difficulty: body.difficulty,
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
    })

    return NextResponse.json(newExercise, { status: 201 })
  } catch (error) {
    console.error('Create exercise error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}