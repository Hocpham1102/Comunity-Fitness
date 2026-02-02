import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedWorkoutTemplates() {
    console.log('🏋️ Seeding workout templates...')

    // Get a trainer user (or create one if needed)
    let trainer = await prisma.user.findFirst({
        where: { role: 'TRAINER' }
    })

    if (!trainer) {
        console.log('No trainer found, creating one...')
        trainer = await prisma.user.create({
            data: {
                email: 'trainer@example.com',
                name: 'Demo Trainer',
                role: 'TRAINER',
                password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password123
            }
        })
    }

    console.log(`Using trainer: ${trainer.name} (${trainer.email})`)

    // Get some exercises for the templates
    const exercises = await prisma.exercise.findMany({
        take: 20,
        orderBy: { name: 'asc' }
    })

    if (exercises.length === 0) {
        console.log('⚠️  No exercises found in database. Please run seed-exercises.ts first!')
        return
    }

    console.log(`Found ${exercises.length} exercises`)

    // Create workout templates
    const templates = [
        {
            name: 'Upper Body Strength',
            description: 'Build upper body strength with compound movements',
            difficulty: 'INTERMEDIATE',
            estimatedTime: 45,
            exerciseIds: exercises.slice(0, 6).map(e => e.id)
        },
        {
            name: 'Full Body HIIT',
            description: 'High-intensity interval training for full body conditioning',
            difficulty: 'ADVANCED',
            estimatedTime: 30,
            exerciseIds: exercises.slice(6, 12).map(e => e.id)
        },
        {
            name: 'Beginner Strength Training',
            description: 'Perfect for those new to strength training',
            difficulty: 'BEGINNER',
            estimatedTime: 40,
            exerciseIds: exercises.slice(12, 17).map(e => e.id)
        },
        {
            name: 'Core & Abs Blast',
            description: 'Targeted core workout for building a strong midsection',
            difficulty: 'INTERMEDIATE',
            estimatedTime: 25,
            exerciseIds: exercises.slice(0, 5).map(e => e.id)
        },
        {
            name: 'Lower Body Power',
            description: 'Build explosive lower body strength and power',
            difficulty: 'ADVANCED',
            estimatedTime: 50,
            exerciseIds: exercises.slice(5, 11).map(e => e.id)
        }
    ]

    for (const template of templates) {
        console.log(`Creating template: ${template.name}`)

        const workout = await prisma.workout.create({
            data: {
                name: template.name,
                description: template.description,
                difficulty: template.difficulty as any,
                estimatedTime: template.estimatedTime,
                isTemplate: true,
                isPublic: false, // Private to trainer
                createdById: trainer.id,
                exercises: {
                    create: template.exerciseIds.map((exerciseId, index) => ({
                        exerciseId,
                        order: index + 1,
                        sets: 3,
                        reps: index % 2 === 0 ? 12 : 10,
                        rest: 60,
                        notes: index === 0 ? 'Warm up properly before starting' : undefined
                    }))
                }
            },
            include: {
                exercises: true
            }
        })

        console.log(`✅ Created: ${workout.name} with ${workout.exercises.length} exercises`)
    }

    console.log('✅ Workout templates seeded successfully!')
}

seedWorkoutTemplates()
    .catch((e) => {
        console.error('Error seeding workout templates:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
