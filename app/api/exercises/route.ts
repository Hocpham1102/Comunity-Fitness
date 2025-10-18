import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrNull } from '@/lib/server/auth/session'
import { searchExercises } from '@/lib/server/services/exercises.service'
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