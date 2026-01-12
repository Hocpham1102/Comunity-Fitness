import { db } from '@/lib/server/db/prisma'

export interface AuthUser {
  id: string
  role?: string
}

export interface CreateWorkoutLogData {
  workoutId: string
  title: string
  notes?: string
}

export interface UpdateProgressData {
  currentExerciseOrder?: number
  currentSetNumber?: number
  restUntil?: Date
}

export interface SetLogData {
  exerciseId: string
  setNumber: number
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  completed?: boolean
}

export interface WorkoutStats {
  totalSessions: number
  totalDuration: number // minutes
  totalVolume: number // kg
  averageSessionDuration: number
  lastWorkoutDate?: Date
  thisMonthSessions?: number
  thisMonthDuration?: number
  percentageChange?: number
}

export async function createWorkoutLog(userId: string, data: CreateWorkoutLogData) {
  // Verify workout exists and user has access
  const workout = await db.workout.findUnique({
    where: { id: data.workoutId },
    select: { id: true, name: true, isPublic: true, createdById: true },
  })

  if (!workout) {
    throw new Error('Workout not found')
  }

  if (!workout.isPublic && workout.createdById !== userId) {
    throw new Error('Access denied')
  }

  return db.workoutLog.create({
    data: {
      userId,
      workoutId: data.workoutId,
      title: data.title,
      notes: data.notes,
      startedAt: new Date(),
    },
    include: {
      workout: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })
}

export async function updateWorkoutProgress(
  logId: string,
  data: UpdateProgressData,
  user: AuthUser
) {
  const log = await db.workoutLog.findUnique({
    where: { id: logId },
    select: { id: true, userId: true },
  })

  if (!log) {
    throw new Error('Workout log not found')
  }

  if (log.userId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Access denied')
  }

  return db.workoutLog.update({
    where: { id: logId },
    data: {
      currentExerciseOrder: data.currentExerciseOrder,
      currentSetNumber: data.currentSetNumber,
      restUntil: data.restUntil,
      updatedAt: new Date(),
    },
  })
}

export async function appendSetToWorkout(
  logId: string,
  data: SetLogData,
  user: AuthUser
) {
  const log = await db.workoutLog.findUnique({
    where: { id: logId },
    select: { id: true, userId: true },
  })

  if (!log) {
    throw new Error('Workout log not found')
  }

  if (log.userId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Access denied')
  }

  // Find or create exercise log
  let exerciseLog = await db.exerciseLog.findFirst({
    where: {
      workoutLogId: logId,
      exerciseId: data.exerciseId,
    },
  })

  if (!exerciseLog) {
    exerciseLog = await db.exerciseLog.create({
      data: {
        workoutLogId: logId,
        exerciseId: data.exerciseId,
      },
    })
  }

  // Create set log
  return db.setLog.create({
    data: {
      exerciseLogId: exerciseLog.id,
      setNumber: data.setNumber,
      reps: data.reps,
      weight: data.weight,
      duration: data.duration,
      distance: data.distance,
      completed: data.completed ?? true,
    },
  })
}

export async function completeWorkout(logId: string, user: AuthUser) {
  const log = await db.workoutLog.findUnique({
    where: { id: logId },
    select: { id: true, userId: true, startedAt: true },
  })

  if (!log) {
    throw new Error('Workout log not found')
  }

  if (log.userId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Access denied')
  }

  const completedAt = new Date()
  const duration = Math.round((completedAt.getTime() - log.startedAt.getTime()) / (1000 * 60)) // minutes

  return db.workoutLog.update({
    where: { id: logId },
    data: {
      completedAt,
      duration,
      updatedAt: completedAt,
    },
  })
}

export async function getWorkoutLogById(logId: string, user: AuthUser) {
  const log = await db.workoutLog.findUnique({
    where: { id: logId },
    include: {
      workout: {
        select: { id: true, name: true, difficulty: true, description: true },
      },
      exerciseLogs: {
        include: {
          exercise: {
            select: { id: true, name: true, muscleGroups: true, equipment: true },
          },
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
      },
    },
  })

  if (!log) {
    throw new Error('Workout log not found')
  }

  if (log.userId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Access denied')
  }

  return log
}

export async function getWorkoutHistory(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const [logs, total] = await Promise.all([
    db.workoutLog.findMany({
      where: { userId },
      include: {
        workout: {
          select: { id: true, name: true, difficulty: true },
        },
        _count: { select: { exerciseLogs: true } },
      },
      orderBy: { startedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.workoutLog.count({ where: { userId } }),
  ])

  return {
    items: logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getExerciseHistory(userId: string, exerciseId: string) {
  return db.setLog.findMany({
    where: {
      exerciseLog: {
        workoutLog: { userId },
        exerciseId,
      },
    },
    include: {
      exerciseLog: {
        include: {
          workoutLog: {
            select: { startedAt: true, title: true },
          },
        },
      },
    },
    orderBy: {
      exerciseLog: {
        workoutLog: { startedAt: 'desc' },
      },
    },
  })
}

export async function computeWorkoutStats(userId: string): Promise<WorkoutStats> {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Fetch all completed workouts
  const logs = await db.workoutLog.findMany({
    where: {
      userId,
      completedAt: { not: null },
    },
    select: {
      duration: true,
      startedAt: true,
      completedAt: true,
      exerciseLogs: {
        include: {
          sets: {
            select: {
              weight: true,
              reps: true,
            },
          },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  })

  // Filter for this month and last month
  const thisMonthLogs = logs.filter(log =>
    log.completedAt && new Date(log.completedAt) >= startOfThisMonth
  )
  const lastMonthLogs = logs.filter(log =>
    log.completedAt &&
    new Date(log.completedAt) >= startOfLastMonth &&
    new Date(log.completedAt) <= endOfLastMonth
  )

  // Calculate totals
  const totalSessions = logs.length
  const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0)
  const totalVolume = logs.reduce((sum, log) => {
    return sum + log.exerciseLogs.reduce((exerciseSum, exerciseLog) => {
      return exerciseSum + exerciseLog.sets.reduce((setSum, set) => {
        return setSum + ((set.weight || 0) * (set.reps || 0))
      }, 0)
    }, 0)
  }, 0)

  // Calculate this month stats
  const thisMonthSessions = thisMonthLogs.length
  const thisMonthDuration = thisMonthLogs.reduce((sum, log) => sum + (log.duration || 0), 0)

  // Calculate last month stats
  const lastMonthSessions = lastMonthLogs.length

  // Calculate percentage change
  const percentageChange = lastMonthSessions > 0
    ? ((thisMonthSessions - lastMonthSessions) / lastMonthSessions) * 100
    : thisMonthSessions > 0 ? 100 : 0

  return {
    totalSessions,
    totalDuration,
    totalVolume,
    averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
    lastWorkoutDate: logs[0]?.startedAt,
    thisMonthSessions,
    thisMonthDuration,
    percentageChange: Math.round(percentageChange),
  }
}
