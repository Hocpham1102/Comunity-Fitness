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
            throw new Error(`Exercise "${name}" not found in database. Available exercises: ${Array.from(exerciseMap.keys()).join(', ')}`)
        }
        return id
    }

    console.log(`Found ${exercises.length} exercises in database\n`)

    // ============================================
    // 1. BEGINNER FULL BODY WORKOUT
    // ============================================
    const beginnerFullBody = await prisma.workout.create({
        data: {
            name: 'Beginner Full Body Workout',
            description: 'A comprehensive full-body workout perfect for beginners. This routine hits all major muscle groups in one session and should be performed 3 times per week with at least one rest day between sessions. Focus on learning proper form and building a foundation.',
            difficulty: DifficultyLevel.BEGINNER,
            estimatedTime: 50,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Barbell Back Squat'),
                        order: 0,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Focus on proper form and depth - go to parallel'
                    },
                    {
                        exerciseId: getExerciseId('Dumbbell Bench Press'),
                        order: 1,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Control the weight, full range of motion'
                    },
                    {
                        exerciseId: getExerciseId('Lat Pulldown'),
                        order: 2,
                        sets: 3,
                        reps: 12,
                        rest: 90,
                        notes: 'Pull to upper chest, squeeze shoulder blades'
                    },
                    {
                        exerciseId: getExerciseId('Dumbbell Shoulder Press'),
                        order: 3,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Keep core tight, press straight up'
                    },
                    {
                        exerciseId: getExerciseId('Leg Curl'),
                        order: 4,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Hamstring isolation - squeeze at top'
                    },
                    {
                        exerciseId: getExerciseId('Plank'),
                        order: 5,
                        sets: 3,
                        reps: 1,
                        duration: 45,
                        rest: 60,
                        notes: 'Hold for 45 seconds, maintain straight body line'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Beginner Full Body Workout')

    // ============================================
    // 2. PUSH DAY - CHEST, SHOULDERS, TRICEPS
    // ============================================
    const pushDay = await prisma.workout.create({
        data: {
            name: 'Push Day - Chest, Shoulders, Triceps',
            description: 'Comprehensive push workout targeting chest, shoulders, and triceps. Perfect for a push/pull/legs split. Combines heavy compound movements with isolation exercises for complete muscle development.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 75,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Barbell Bench Press'),
                        order: 0,
                        sets: 4,
                        reps: 8,
                        rest: 120,
                        notes: 'Main compound movement - progressive overload'
                    },
                    {
                        exerciseId: getExerciseId('Incline Dumbbell Press'),
                        order: 1,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Upper chest focus - 30-45 degree incline'
                    },
                    {
                        exerciseId: getExerciseId('Cable Chest Fly'),
                        order: 2,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Chest isolation - constant tension'
                    },
                    {
                        exerciseId: getExerciseId('Overhead Barbell Press'),
                        order: 3,
                        sets: 4,
                        reps: 8,
                        rest: 120,
                        notes: 'Main shoulder builder - strict form'
                    },
                    {
                        exerciseId: getExerciseId('Lateral Raise'),
                        order: 4,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Side delt isolation - control the weight'
                    },
                    {
                        exerciseId: getExerciseId('Tricep Pushdown'),
                        order: 5,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Keep elbows stationary, full extension'
                    },
                    {
                        exerciseId: getExerciseId('Overhead Tricep Extension'),
                        order: 6,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Long head emphasis - feel the stretch'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Push Day - Chest, Shoulders, Triceps')

    // ============================================
    // 3. PULL DAY - BACK & BICEPS
    // ============================================
    const pullDay = await prisma.workout.create({
        data: {
            name: 'Pull Day - Back & Biceps',
            description: 'Complete back and biceps workout focusing on all pulling movements. Builds a strong, wide back and powerful arms. Combines deadlifts, rows, pull-ups, and targeted bicep work.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 75,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Conventional Deadlift'),
                        order: 0,
                        sets: 4,
                        reps: 6,
                        rest: 180,
                        notes: 'King of exercises - perfect form is critical'
                    },
                    {
                        exerciseId: getExerciseId('Pull-ups'),
                        order: 1,
                        sets: 4,
                        reps: 8,
                        rest: 120,
                        notes: 'Use assistance if needed, focus on lats'
                    },
                    {
                        exerciseId: getExerciseId('Barbell Row'),
                        order: 2,
                        sets: 4,
                        reps: 10,
                        rest: 90,
                        notes: 'Pull to lower chest, squeeze shoulder blades'
                    },
                    {
                        exerciseId: getExerciseId('Seated Cable Row'),
                        order: 3,
                        sets: 3,
                        reps: 12,
                        rest: 90,
                        notes: 'Mid-back focus - controlled movement'
                    },
                    {
                        exerciseId: getExerciseId('Face Pulls'),
                        order: 4,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Rear delts and upper back - high elbows'
                    },
                    {
                        exerciseId: getExerciseId('Barbell Curl'),
                        order: 5,
                        sets: 3,
                        reps: 10,
                        rest: 60,
                        notes: 'Strict form - no swinging'
                    },
                    {
                        exerciseId: getExerciseId('Hammer Curl'),
                        order: 6,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Targets brachialis and forearms'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Pull Day - Back & Biceps')

    // ============================================
    // 4. LEG DAY - COMPLETE LOWER BODY
    // ============================================
    const legDay = await prisma.workout.create({
        data: {
            name: 'Leg Day - Complete Lower Body',
            description: 'Comprehensive leg workout targeting quads, hamstrings, glutes, and calves. Build powerful legs with a combination of heavy squats, accessory movements, and isolation work. Prepare for serious DOMS!',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 75,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Barbell Back Squat'),
                        order: 0,
                        sets: 4,
                        reps: 10,
                        rest: 120,
                        notes: 'Go deep, drive through heels - king of leg exercises'
                    },
                    {
                        exerciseId: getExerciseId('Romanian Deadlift'),
                        order: 1,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Feel the hamstring stretch, hinge at hips'
                    },
                    {
                        exerciseId: getExerciseId('Leg Press'),
                        order: 2,
                        sets: 3,
                        reps: 12,
                        rest: 90,
                        notes: 'Full range of motion, controlled tempo'
                    },
                    {
                        exerciseId: getExerciseId('Bulgarian Split Squat'),
                        order: 3,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: '12 reps per leg - great for balance and glutes'
                    },
                    {
                        exerciseId: getExerciseId('Leg Curl'),
                        order: 4,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Hamstring isolation - squeeze at top'
                    },
                    {
                        exerciseId: getExerciseId('Leg Extension'),
                        order: 5,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Quad isolation - full extension'
                    },
                    {
                        exerciseId: getExerciseId('Standing Calf Raise'),
                        order: 6,
                        sets: 4,
                        reps: 20,
                        rest: 60,
                        notes: 'Full stretch and contraction - don\'t neglect calves!'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Leg Day - Complete Lower Body')

    // ============================================
    // 5. UPPER BODY STRENGTH
    // ============================================
    const upperBodyStrength = await prisma.workout.create({
        data: {
            name: 'Upper Body Strength',
            description: 'Advanced upper body strength program focusing on heavy compound movements. Build serious strength in chest, back, shoulders, and arms with lower rep ranges and longer rest periods. For experienced lifters.',
            difficulty: DifficultyLevel.ADVANCED,
            estimatedTime: 85,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Barbell Bench Press'),
                        order: 0,
                        sets: 5,
                        reps: 5,
                        rest: 180,
                        notes: 'Heavy weight - strength focus, perfect form'
                    },
                    {
                        exerciseId: getExerciseId('Barbell Row'),
                        order: 1,
                        sets: 5,
                        reps: 5,
                        rest: 180,
                        notes: 'Match your bench press strength'
                    },
                    {
                        exerciseId: getExerciseId('Overhead Barbell Press'),
                        order: 2,
                        sets: 4,
                        reps: 6,
                        rest: 150,
                        notes: 'Strict form, no leg drive'
                    },
                    {
                        exerciseId: getExerciseId('Pull-ups'),
                        order: 3,
                        sets: 4,
                        reps: 8,
                        rest: 120,
                        notes: 'Add weight if possible - build pulling strength'
                    },
                    {
                        exerciseId: getExerciseId('Close-Grip Bench Press'),
                        order: 4,
                        sets: 3,
                        reps: 8,
                        rest: 120,
                        notes: 'Tricep and chest strength builder'
                    },
                    {
                        exerciseId: getExerciseId('Barbell Curl'),
                        order: 5,
                        sets: 3,
                        reps: 8,
                        rest: 90,
                        notes: 'Heavy bicep work - controlled tempo'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Upper Body Strength')

    // ============================================
    // 6. CORE & CARDIO BLAST
    // ============================================
    const coreCardio = await prisma.workout.create({
        data: {
            name: 'Core & Cardio Blast',
            description: 'High-energy workout combining core strengthening with cardio intervals. Perfect for fat loss, core development, and cardiovascular fitness. Can be done as standalone workout or added as a finisher.',
            difficulty: DifficultyLevel.BEGINNER,
            estimatedTime: 40,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Jump Rope'),
                        order: 0,
                        sets: 3,
                        reps: 100,
                        rest: 60,
                        notes: 'Warm up and elevate heart rate'
                    },
                    {
                        exerciseId: getExerciseId('Plank'),
                        order: 1,
                        sets: 3,
                        reps: 1,
                        duration: 60,
                        rest: 60,
                        notes: 'Hold for 60 seconds - quality over duration'
                    },
                    {
                        exerciseId: getExerciseId('Mountain Climbers'),
                        order: 2,
                        sets: 3,
                        reps: 30,
                        rest: 45,
                        notes: 'Fast pace - cardio and core combined'
                    },
                    {
                        exerciseId: getExerciseId('Russian Twist'),
                        order: 3,
                        sets: 3,
                        reps: 30,
                        rest: 45,
                        notes: '30 total reps (15 each side) - control rotation'
                    },
                    {
                        exerciseId: getExerciseId('Burpees'),
                        order: 4,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Full body conditioning - push yourself'
                    },
                    {
                        exerciseId: getExerciseId('Hanging Leg Raise'),
                        order: 5,
                        sets: 3,
                        reps: 10,
                        rest: 60,
                        notes: 'Advanced ab exercise - modify if needed'
                    },
                    {
                        exerciseId: getExerciseId('Running'),
                        order: 6,
                        sets: 1,
                        reps: 1,
                        duration: 1200,
                        rest: 0,
                        notes: '20 minutes steady-state cardio to finish'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Core & Cardio Blast')

    // ============================================
    // 7. CHEST & TRICEPS HYPERTROPHY
    // ============================================
    const chestTriceps = await prisma.workout.create({
        data: {
            name: 'Chest & Triceps Hypertrophy',
            description: 'Focused chest and triceps workout designed for muscle growth. Multiple angles and exercises to fully develop the chest, followed by comprehensive tricep work. Perfect for bodybuilding-style training.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 65,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Barbell Bench Press'),
                        order: 0,
                        sets: 4,
                        reps: 10,
                        rest: 90,
                        notes: 'Moderate weight, focus on muscle contraction'
                    },
                    {
                        exerciseId: getExerciseId('Incline Barbell Bench Press'),
                        order: 1,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Upper chest development'
                    },
                    {
                        exerciseId: getExerciseId('Dumbbell Fly'),
                        order: 2,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Deep stretch, squeeze at top'
                    },
                    {
                        exerciseId: getExerciseId('Chest Dips'),
                        order: 3,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Lean forward for chest emphasis'
                    },
                    {
                        exerciseId: getExerciseId('Tricep Dips'),
                        order: 4,
                        sets: 3,
                        reps: 12,
                        rest: 90,
                        notes: 'Stay upright for tricep focus'
                    },
                    {
                        exerciseId: getExerciseId('Skull Crushers'),
                        order: 5,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Controlled tempo, feel the stretch'
                    },
                    {
                        exerciseId: getExerciseId('Tricep Pushdown'),
                        order: 6,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Finish with high reps, full extension'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Chest & Triceps Hypertrophy')

    // ============================================
    // 8. BACK & BICEPS MASS BUILDER
    // ============================================
    const backBiceps = await prisma.workout.create({
        data: {
            name: 'Back & Biceps Mass Builder',
            description: 'Comprehensive back and biceps workout for maximum muscle growth. Combines heavy compound movements with volume work and isolation exercises. Build a thick, wide back and peaked biceps.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 70,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Conventional Deadlift'),
                        order: 0,
                        sets: 4,
                        reps: 6,
                        rest: 180,
                        notes: 'Foundation movement - build total back mass'
                    },
                    {
                        exerciseId: getExerciseId('Pull-ups'),
                        order: 1,
                        sets: 4,
                        reps: 10,
                        rest: 120,
                        notes: 'Lat width - full range of motion'
                    },
                    {
                        exerciseId: getExerciseId('T-Bar Row'),
                        order: 2,
                        sets: 4,
                        reps: 10,
                        rest: 90,
                        notes: 'Back thickness - squeeze hard'
                    },
                    {
                        exerciseId: getExerciseId('Single-Arm Dumbbell Row'),
                        order: 3,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: '12 reps per arm - focus on contraction'
                    },
                    {
                        exerciseId: getExerciseId('Face Pulls'),
                        order: 4,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Rear delts and upper back health'
                    },
                    {
                        exerciseId: getExerciseId('Barbell Curl'),
                        order: 5,
                        sets: 4,
                        reps: 10,
                        rest: 60,
                        notes: 'Mass builder - strict form'
                    },
                    {
                        exerciseId: getExerciseId('Hammer Curl'),
                        order: 6,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Brachialis and forearm development'
                    },
                    {
                        exerciseId: getExerciseId('Cable Curl'),
                        order: 7,
                        sets: 3,
                        reps: 15,
                        rest: 45,
                        notes: 'Constant tension finish - pump'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Back & Biceps Mass Builder')

    // ============================================
    // 9. SHOULDER SPECIALIZATION
    // ============================================
    const shoulderSpecialization = await prisma.workout.create({
        data: {
            name: 'Shoulder Specialization',
            description: 'Dedicated shoulder workout hitting all three deltoid heads. Build boulder shoulders with a combination of pressing movements and isolation work for front, side, and rear delts.',
            difficulty: DifficultyLevel.INTERMEDIATE,
            estimatedTime: 55,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Overhead Barbell Press'),
                        order: 0,
                        sets: 4,
                        reps: 8,
                        rest: 120,
                        notes: 'Main shoulder builder - go heavy'
                    },
                    {
                        exerciseId: getExerciseId('Arnold Press'),
                        order: 1,
                        sets: 3,
                        reps: 10,
                        rest: 90,
                        notes: 'Hits all three delt heads'
                    },
                    {
                        exerciseId: getExerciseId('Lateral Raise'),
                        order: 2,
                        sets: 4,
                        reps: 15,
                        rest: 60,
                        notes: 'Side delt focus - build width'
                    },
                    {
                        exerciseId: getExerciseId('Front Raise'),
                        order: 3,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Front delt isolation'
                    },
                    {
                        exerciseId: getExerciseId('Rear Delt Fly'),
                        order: 4,
                        sets: 4,
                        reps: 15,
                        rest: 60,
                        notes: 'Rear delt development - often neglected'
                    },
                    {
                        exerciseId: getExerciseId('Face Pulls'),
                        order: 5,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Rear delts and upper back - shoulder health'
                    },
                    {
                        exerciseId: getExerciseId('Upright Row'),
                        order: 6,
                        sets: 3,
                        reps: 12,
                        rest: 60,
                        notes: 'Delts and traps - use moderate weight'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Shoulder Specialization')

    // ============================================
    // 10. FUNCTIONAL ATHLETE
    // ============================================
    const functionalAthlete = await prisma.workout.create({
        data: {
            name: 'Functional Athlete Training',
            description: 'Athletic performance workout combining strength, power, and conditioning. Build real-world strength and explosiveness with functional movements. Perfect for athletes and those seeking overall fitness.',
            difficulty: DifficultyLevel.ADVANCED,
            estimatedTime: 60,
            isTemplate: true,
            isPublic: true,
            exercises: {
                create: [
                    {
                        exerciseId: getExerciseId('Conventional Deadlift'),
                        order: 0,
                        sets: 4,
                        reps: 5,
                        rest: 180,
                        notes: 'Power and strength foundation'
                    },
                    {
                        exerciseId: getExerciseId('Barbell Back Squat'),
                        order: 1,
                        sets: 4,
                        reps: 6,
                        rest: 150,
                        notes: 'Lower body power'
                    },
                    {
                        exerciseId: getExerciseId('Pull-ups'),
                        order: 2,
                        sets: 4,
                        reps: 10,
                        rest: 90,
                        notes: 'Upper body pulling strength'
                    },
                    {
                        exerciseId: getExerciseId('Kettlebell Swing'),
                        order: 3,
                        sets: 4,
                        reps: 20,
                        rest: 90,
                        notes: 'Explosive hip power and conditioning'
                    },
                    {
                        exerciseId: getExerciseId('Farmer\'s Walk'),
                        order: 4,
                        sets: 3,
                        reps: 1,
                        duration: 60,
                        rest: 90,
                        notes: 'Grip, core, and overall strength - 60 seconds'
                    },
                    {
                        exerciseId: getExerciseId('Burpees'),
                        order: 5,
                        sets: 3,
                        reps: 15,
                        rest: 60,
                        notes: 'Full body conditioning'
                    },
                    {
                        exerciseId: getExerciseId('Battle Ropes'),
                        order: 6,
                        sets: 3,
                        reps: 1,
                        duration: 30,
                        rest: 60,
                        notes: '30 seconds all-out effort'
                    }
                ]
            }
        }
    })
    console.log('✅ Created: Functional Athlete Training')

    console.log('\n' + '='.repeat(70))
    console.log('🎉 Successfully seeded 10 comprehensive workout templates!')
    console.log('='.repeat(70))
    console.log('\nWorkout Templates Created:')
    console.log('1. Beginner Full Body Workout (BEGINNER, ~50 min)')
    console.log('2. Push Day - Chest, Shoulders, Triceps (INTERMEDIATE, ~75 min)')
    console.log('3. Pull Day - Back & Biceps (INTERMEDIATE, ~75 min)')
    console.log('4. Leg Day - Complete Lower Body (INTERMEDIATE, ~75 min)')
    console.log('5. Upper Body Strength (ADVANCED, ~85 min)')
    console.log('6. Core & Cardio Blast (BEGINNER, ~40 min)')
    console.log('7. Chest & Triceps Hypertrophy (INTERMEDIATE, ~65 min)')
    console.log('8. Back & Biceps Mass Builder (INTERMEDIATE, ~70 min)')
    console.log('9. Shoulder Specialization (INTERMEDIATE, ~55 min)')
    console.log('10. Functional Athlete Training (ADVANCED, ~60 min)')
    console.log('\n' + '='.repeat(70))
}

main()
    .catch((e) => {
        console.error('Error seeding workout templates:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
