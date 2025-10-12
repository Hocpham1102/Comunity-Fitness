import { z } from 'zod'

export const profileSchema = z.object({
  dateOfBirth: z.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  height: z.number().positive('Height must be positive').optional(),
  currentWeight: z.number().positive('Weight must be positive').optional(),
  targetWeight: z.number().positive('Target weight must be positive').optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE']).optional(),
  fitnessGoal: z.enum(['LOSE_WEIGHT', 'GAIN_MUSCLE', 'MAINTAIN_WEIGHT', 'IMPROVE_ENDURANCE', 'GENERAL_FITNESS']).optional(),
})

export const measurementSchema = z.object({
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  arms: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  notes: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type MeasurementFormData = z.infer<typeof measurementSchema>
