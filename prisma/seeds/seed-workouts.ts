import { PrismaClient, DifficultyLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting workout template seeding with enhanced exercises...')

    // First, fetch all exercises to get their IDs
    const exercises = await prisma.exercise.findMany({
        select: { id: true, name: true }
    })

    // Create a map for easy exercise lookup
    const exerciseMap = new Map(exercises.map(ex => [ex.name, ex.id]))

    // Helper function to get exercise ID
    const getExerciseId = (name: string): string => {
        const id = exerciseMap.get(name)
        if (!id) {
            // Fallback: try to find a similar name or just warn
            // For seed purposes, if strict match fails, we might skip or use a placeholder if we were advanced, 
            // but here we'll throw to alert us to fix the seed data names.
            // Actually, to be robust, let's warn and return null, then filter out nulls in execution
            console.warn(`WARNING: Exercise "${name}" not found. skipping...`)
            return ""
        }
        return id
    }

    console.log(`Found ${exercises.length} exercises in database\n`)

    interface TemplateExercise {
        name: string
        sets: number
        reps: number
        rest: number
        notes: string
        duration?: number
    }

    interface WorkoutTemplate {
        name: string
        description: string
        difficulty: DifficultyLevel
        estimatedTime: number
        exercises: TemplateExercise[]
    }

    const templates: WorkoutTemplate[] = [
        {
            name: 'Beginner Full Body Workout',
            description: 'A comprehensive full-body workout perfect for beginners. This routine hits all major muscle groups in one session and should be performed 3 times per week with at least one rest day between sessions. Focus on learning proper form and building a foundation.',
            difficulty: DifficultyLevel.BEGINNER,
            estimatedTime: 50,
            exercises: [
                { name: 'Barbell Back Squat', sets: 3, reps: 10, rest: 90, notes: 'Focus on proper form and depth - go to parallel' },
                { name: 'Dumbbell Bench Press', sets: 3, reps: 10, rest: 90, notes: 'Control the weight, full range of motion' },
                { name: 'Lat Pulldown', sets: 3, reps: 12, rest: 90, notes: 'Pull to upper chest, squeeze shoulder blades' },
                { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest: 90, notes: 'Keep core tight, press straight up' },
                { name: 'Leg Curl', sets: 3, reps: 12, rest: 60, notes: 'Hamstring isolation - squeeze at top' },
                { name: 'Plank', sets: 3, reps: 1, duration: 45, rest: 60, notes: 'Hold for 45 seconds, maintain straight body line' }
            ]
        },
        {
            name: 'Push Day - Chest, Shoulders, Triceps',
            description: 'Comprehensive push workout targeting chest, shoulders, and triceps. Perfect for a push/pull/legs split. Combines heavy compound movements with isolation exercises for complete muscle development.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 75,
            exercises: [
                { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 120, notes: 'Main compound movement - progressive overload' },
                { name: 'Incline Dumbbell Press', sets: 3, reps: 10, rest: 90, notes: 'Upper chest focus - 30-45 degree incline' },
                { name: 'Cable Chest Fly', sets: 3, reps: 12, rest: 60, notes: 'Chest isolation - constant tension' },
                { name: 'Overhead Barbell Press', sets: 4, reps: 8, rest: 120, notes: 'Main shoulder builder - strict form' },
                { name: 'Lateral Raise', sets: 3, reps: 15, rest: 60, notes: 'Side delt isolation - control the weight' },
                { name: 'Tricep Pushdown', sets: 3, reps: 15, rest: 60, notes: 'Keep elbows stationary, full extension' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: 12, rest: 60, notes: 'Long head emphasis - feel the stretch' }
            ]
        },
        {
            name: 'Pull Day - Back & Biceps',
            description: 'Complete back and biceps workout focusing on all pulling movements. Builds a strong, wide back and powerful arms. Combines deadlifts, rows, pull-ups, and targeted bicep work.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 75,
            exercises: [
                { name: 'Conventional Deadlift', sets: 4, reps: 6, rest: 180, notes: 'King of exercises - perfect form is critical' },
                { name: 'Pull-ups', sets: 4, reps: 8, rest: 120, notes: 'Use assistance if needed, focus on lats' },
                { name: 'Barbell Row', sets: 4, reps: 10, rest: 90, notes: 'Pull to lower chest, squeeze shoulder blades' },
                { name: 'Seated Cable Row', sets: 3, reps: 12, rest: 90, notes: 'Mid-back focus - controlled movement' },
                { name: 'Face Pulls', sets: 3, reps: 15, rest: 60, notes: 'Rear delts and upper back - high elbows' },
                { name: 'Barbell Curl', sets: 3, reps: 10, rest: 60, notes: 'Strict form - no swinging' },
                { name: 'Hammer Curl', sets: 3, reps: 12, rest: 60, notes: 'Targets brachialis and forearms' }
            ]
        },
        {
            name: 'Leg Day - Complete Lower Body',
            description: 'Comprehensive leg workout targeting quads, hamstrings, glutes, and calves. Build powerful legs with a combination of heavy squats, accessory movements, and isolation work.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 75,
            exercises: [
                { name: 'Barbell Back Squat', sets: 4, reps: 10, rest: 120, notes: 'Go deep, drive through heels - king of leg exercises' },
                { name: 'Romanian Deadlift', sets: 3, reps: 10, rest: 90, notes: 'Feel the hamstring stretch, hinge at hips' },
                { name: 'Leg Press', sets: 3, reps: 12, rest: 90, notes: 'Full range of motion, controlled tempo' },
                { name: 'Bulgarian Split Squat', sets: 3, reps: 12, rest: 60, notes: '12 reps per leg - great for balance and glutes' },
                { name: 'Leg Curl', sets: 3, reps: 15, rest: 60, notes: 'Hamstring isolation - squeeze at top' },
                { name: 'Leg Extension', sets: 3, reps: 15, rest: 60, notes: 'Quad isolation - full extension' },
                { name: 'Standing Calf Raise', sets: 4, reps: 20, rest: 60, notes: 'Full stretch and contraction' }
            ]
        },
        {
            name: 'Upper Body Strength',
            description: 'Advanced upper body strength program focusing on heavy compound movements. Build serious strength in chest, back, shoulders, and arms with lower rep ranges.',
            difficulty: DifficultyLevel.ADVANCED,
            estimatedTime: 85,
            exercises: [
                { name: 'Barbell Bench Press', sets: 5, reps: 5, rest: 180, notes: 'Heavy weight - strength focus, perfect form' },
                { name: 'Barbell Row', sets: 5, reps: 5, rest: 180, notes: 'Match your bench press strength' },
                { name: 'Overhead Barbell Press', sets: 4, reps: 6, rest: 150, notes: 'Strict form, no leg drive' },
                { name: 'Pull-ups', sets: 4, reps: 8, rest: 120, notes: 'Add weight if possible - build pulling strength' },
                { name: 'Close-Grip Bench Press', sets: 3, reps: 8, rest: 120, notes: 'Tricep and chest strength builder' },
                { name: 'Barbell Curl', sets: 3, reps: 8, rest: 90, notes: 'Heavy bicep work - controlled tempo' }
            ]
        },
        {
            name: 'Core & Cardio Blast',
            description: 'High-energy workout combining core strengthening with cardio intervals. Perfect for fat loss, core development, and cardiovascular fitness.',
            difficulty: DifficultyLevel.BEGINNER,
            estimatedTime: 40,
            exercises: [
                { name: 'Jump Rope', sets: 3, reps: 100, rest: 60, notes: 'Warm up and elevate heart rate' },
                { name: 'Plank', sets: 3, reps: 1, duration: 60, rest: 60, notes: 'Hold for 60 seconds - quality over duration' },
                { name: 'Mountain Climbers', sets: 3, reps: 30, rest: 45, notes: 'Fast pace - cardio and core combined' },
                { name: 'Russian Twist', sets: 3, reps: 30, rest: 45, notes: '30 total reps (15 each side) - control rotation' },
                { name: 'Burpees', sets: 3, reps: 15, rest: 60, notes: 'Full body conditioning - push yourself' },
                // { name: 'Hanging Leg Raise', sets: 3, reps: 10, rest: 60, notes: 'Advanced ab exercise' }, // Might not exist
                // { name: 'Running', sets: 1, reps: 1, duration: 1200, rest: 0, notes: '20 minutes steady-state cardio' }
            ]
        }
    ]

    for (const template of templates) {
        console.log(`Creating ${template.name}...`)

        // Prepare exercises with IDs
        const workoutExercises = template.exercises
            .map((ex, index) => {
                const id = getExerciseId(ex.name)
                if (!id) return null
                return {
                    exerciseId: id,
                    order: index,
                    sets: ex.sets,
                    reps: ex.reps,
                    duration: ex.duration,
                    rest: ex.rest,
                    notes: ex.notes
                }
            })
            .filter((ex): ex is NonNullable<typeof ex> => ex !== null)

        if (workoutExercises.length === 0) {
            console.warn(`Skipping ${template.name} - no valid exercises found`)
            continue
        }

        const workout = await prisma.workout.create({
            data: {
                name: template.name,
                description: template.description,
                difficulty: template.difficulty,
                estimatedTime: template.estimatedTime,
                isTemplate: true,
                isPublic: true,
                exercises: {
                    create: workoutExercises
                }
            }
        })
        console.log(`✅ Created ${workout.name} with ${workoutExercises.length} exercises`)
    }

    console.log('\nSeed completed successfully!')
}

main()
    .catch((e) => {
        console.error('Error seeding workout templates:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
