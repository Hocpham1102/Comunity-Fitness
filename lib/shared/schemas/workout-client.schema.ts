import { z } from 'zod'

// Simplified schemas for client-side use
export const MuscleGroupEnum = z.enum([
  'CHEST',
  'BACK', 
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'ABS',
  'OBLIQUES',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES',
  'FULL_BODY',
  'CARDIO',
])

export const EquipmentTypeEnum = z.enum([
  'BARBELL',
  'DUMBBELL',
  'KETTLEBELL',
  'CABLE',
  'MACHINE',
  'BODYWEIGHT',
  'RESISTANCE_BAND',
  'CARDIO_EQUIPMENT',
  'OTHER',
])

export const DifficultyLevelEnum = z.enum([
  'BEGINNER',
  'INTERMEDIATE', 
  'ADVANCED',
  'EXPERT',
])

// Workout basics schema for client forms
export const workoutBasicsSchema = z.object({
  name: z.string()
    .min(1, 'Workout name is required')
    .max(100, 'Name too long'),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  difficulty: DifficultyLevelEnum,
  estimatedTime: z.number()
    .int()
    .min(1, 'Time must be at least 1 minute')
    .max(300, 'Time cannot exceed 5 hours'),
  isTemplate: z.boolean().default(true),
  isPublic: z.boolean().default(false),
})

// Exercise config schema for client forms
export const workoutExerciseConfigSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  name: z.string().min(1, 'Exercise name is required'),
  order: z.number().int().min(0, 'Order must be non-negative'),
  sets: z.number().int().min(1, 'At least 1 set required').max(50, 'Too many sets'),
  reps: z.number().int().min(1, 'At least 1 rep required').max(1000, 'Too many reps').optional(),
  duration: z.number().int().min(1, 'Duration must be positive').max(3600, 'Duration too long').optional(),
  rest: z.number().int().min(0, 'Rest time cannot be negative').max(600, 'Rest time too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
})

// Complete workout schema for client forms
export const workoutSchema = z.object({
  name: z.string()
    .min(1, 'Workout name is required')
    .max(100, 'Name too long'),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  difficulty: DifficultyLevelEnum,
  estimatedTime: z.number()
    .int()
    .min(1, 'Time must be at least 1 minute')
    .max(300, 'Time cannot exceed 5 hours'),
  exercises: z.array(workoutExerciseConfigSchema)
    .min(1, 'At least one exercise is required')
    .max(50, 'Too many exercises'),
  isTemplate: z.boolean().default(true),
  isPublic: z.boolean().default(false),
})

// Type exports
export type MuscleGroup = z.infer<typeof MuscleGroupEnum>
export type EquipmentType = z.infer<typeof EquipmentTypeEnum>
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>
export type WorkoutBasics = z.infer<typeof workoutBasicsSchema>
export type WorkoutExerciseConfig = z.infer<typeof workoutExerciseConfigSchema>
export type Workout = z.infer<typeof workoutSchema>
export type WorkoutFormData = z.infer<typeof workoutSchema>

// Validation helper functions
export const validateWorkoutBasics = (data: unknown) => {
  return workoutBasicsSchema.safeParse(data)
}

export const validateWorkout = (data: unknown) => {
  return workoutSchema.safeParse(data)
}
