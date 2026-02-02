import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'

// GET /api/workouts/assigned - Get all workouts assigned to current user
export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Get all workout assignments for this user
        const assignments = await db.workoutAssignment.findMany({
            where: {
                clientId: user.id,
            },
            include: {
                workout: {
                    include: {
                        exercises: {
                            include: {
                                exercise: {
                                    select: {
                                        id: true,
                                        name: true,
                                        muscleGroups: true,
                                        equipment: true,
                                    },
                                },
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                assignedAt: 'desc',
            },
        })

        return NextResponse.json(
            {
                workouts: assignments.map((a: {
                    workout: {
                        id: string
                        name: string
                        description: string | null
                        difficulty: string
                        estimatedTime: number | null
                        exercises: Array<{
                            id: string
                            exerciseId: string
                            order: number
                            sets: number
                            reps: number | null
                            duration: number | null
                            rest: number | null
                            notes: string | null
                            exercise: {
                                id: string
                                name: string
                                muscleGroups: string[]
                                equipment: string[]
                            }
                        }>
                    }
                    trainer: {
                        id: string
                        name: string | null
                        email: string
                        image: string | null
                    }
                    assignedAt: Date
                    notes: string | null
                }) => ({
                    id: a.workout.id,
                    name: a.workout.name,
                    description: a.workout.description,
                    difficulty: a.workout.difficulty,
                    estimatedTime: a.workout.estimatedTime,
                    exercisesCount: a.workout.exercises.length,
                    exercises: a.workout.exercises.map((we: {
                        id: string
                        exerciseId: string
                        order: number
                        sets: number
                        reps: number | null
                        duration: number | null
                        rest: number | null
                        notes: string | null
                        exercise: {
                            name: string
                            muscleGroups: string[]
                            equipment: string[]
                        }
                    }) => ({
                        id: we.id,
                        exerciseId: we.exerciseId,
                        name: we.exercise.name,
                        order: we.order,
                        sets: we.sets,
                        reps: we.reps,
                        duration: we.duration,
                        rest: we.rest,
                        notes: we.notes,
                        muscleGroups: we.exercise.muscleGroups,
                        equipment: we.exercise.equipment,
                    })),
                    trainerName: a.trainer.name,
                    trainerEmail: a.trainer.email,
                    trainerImage: a.trainer.image,
                    assignedAt: a.assignedAt,
                    assignmentNotes: a.notes,
                })),
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Get assigned workouts error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
