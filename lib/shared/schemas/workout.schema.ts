import { z } from 'zod'

// Enums matching the Prisma schema
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

// Exercise schema
export const exerciseSchema = z.object({
  id: z.string().min(1, 'Exercise ID is required'),
  name: z.string().min(1, 'Exercise name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  muscleGroups: z.array(MuscleGroupEnum),
  equipment: z.array(EquipmentTypeEnum),
  difficulty: DifficultyLevelEnum,
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
})

// Workout exercise configuration schema
export const workoutExerciseConfigSchema = z.object({
  id: z.string().optional(), // For existing workout exercises
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  name: z.string().min(1, 'Exercise name is required'),
  order: z.number().int().min(0, 'Order must be non-negative'),
  sets: z.number().int().min(1, 'At least 1 set required').max(50, 'Too many sets'),
  reps: z.number().int().min(1, 'At least 1 rep required').max(1000, 'Too many reps').optional(),
  duration: z.number().int().min(1, 'Duration must be positive').max(3600, 'Duration too long').optional(), // in seconds
  rest: z.number().int().min(0, 'Rest time cannot be negative').max(600, 'Rest time too long').optional(), // in seconds
  notes: z.string().max(500, 'Notes too long').optional(),
}).refine(
  (data) => data.reps || data.duration,
  {
    message: 'Either reps or duration must be specified',
    path: ['reps'],
  }
)

// Workout basics schema
export const workoutBasicsSchema = z.object({
  name: z.string()
    .min(1, 'Workout name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters'),
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

// Complete workout schema
export const workoutSchema = z.object({
  // Basics
  name: z.string()
    .min(1, 'Workout name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters'),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  difficulty: DifficultyLevelEnum,
  estimatedTime: z.number()
    .int()
    .min(1, 'Time must be at least 1 minute')
    .max(300, 'Time cannot exceed 5 hours'),
  
  // Exercises
  exercises: z.array(workoutExerciseConfigSchema)
    .min(1, 'At least one exercise is required')
    .max(50, 'Too many exercises'),
  
  // Metadata
  isTemplate: z.boolean().default(true),
  isPublic: z.boolean().default(false),
})

// Form data schema (matches the component state)
export const workoutFormDataSchema = workoutSchema

// Server action schemas
export const createWorkoutSchema = workoutSchema

// Create update schema properly
export const updateWorkoutSchema = workoutSchema.partial().extend({
  id: z.string().min(1, 'Workout ID is required'),
})

// Search and filter schemas
export const exerciseSearchSchema = z.object({
  query: z.string().optional(),
  muscleGroups: z.array(MuscleGroupEnum).optional(),
  equipment: z.array(EquipmentTypeEnum).optional(),
  difficulty: DifficultyLevelEnum.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const exerciseFiltersSchema = z.object({
  muscleGroups: z.array(MuscleGroupEnum).optional(),
  equipment: z.array(EquipmentTypeEnum).optional(),
  difficulty: DifficultyLevelEnum.optional(),
  isPublic: z.boolean().optional(),
})

// Type exports
export type MuscleGroup = z.infer<typeof MuscleGroupEnum>
export type EquipmentType = z.infer<typeof EquipmentTypeEnum>
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>
export type Exercise = z.infer<typeof exerciseSchema>
export type WorkoutExerciseConfig = z.infer<typeof workoutExerciseConfigSchema>
export type WorkoutBasics = z.infer<typeof workoutBasicsSchema>
export type Workout = z.infer<typeof workoutSchema>
export type WorkoutFormData = z.infer<typeof workoutFormDataSchema>
export type CreateWorkoutData = z.infer<typeof createWorkoutSchema>
export type UpdateWorkoutData = z.infer<typeof updateWorkoutSchema>
export type ExerciseSearchParams = z.infer<typeof exerciseSearchSchema>
export type ExerciseFilters = z.infer<typeof exerciseFiltersSchema>

// Validation helper functions
export const validateWorkoutBasics = (data: unknown) => {
  return workoutBasicsSchema.safeParse(data)
}

export const validateWorkoutExercise = (data: unknown) => {
  return workoutExerciseConfigSchema.safeParse(data)
}

export const validateWorkout = (data: unknown) => {
  return workoutSchema.safeParse(data)
}

export const validateExerciseSearch = (data: unknown) => {
  return exerciseSearchSchema.safeParse(data)
}