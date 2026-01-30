import { PrismaClient, Role, Gender, ActivityLevel, FitnessGoal } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding users...')

    // Hash password for all accounts
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create Admin Account
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fitness.com' },
        update: {},
        create: {
            email: 'admin@fitness.com',
            name: 'Admin User',
            password: hashedPassword,
            role: Role.ADMIN,
            emailVerified: new Date(),
            profile: {
                create: {
                    gender: Gender.MALE,
                    dateOfBirth: new Date('1990-01-01'),
                    height: 175,
                    currentWeight: 75,
                    targetWeight: 70,
                    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
                    fitnessGoal: FitnessGoal.GENERAL_FITNESS,
                    bmi: 24.5,
                    bmr: 1650,
                    tdee: 2300,
                    targetCalories: 2000,
                    targetProtein: 150,
                    targetCarbs: 200,
                    targetFats: 67,
                    useCustomTargets: false,
                },
            },
        },
    })

    console.log('✅ Created Admin:', admin.email)

    // Create Trainer Account
    const trainer = await prisma.user.upsert({
        where: { email: 'trainer@fitness.com' },
        update: {},
        create: {
            email: 'trainer@fitness.com',
            name: 'John Trainer',
            password: hashedPassword,
            role: Role.TRAINER,
            emailVerified: new Date(),
            profile: {
                create: {
                    gender: Gender.MALE,
                    dateOfBirth: new Date('1988-05-15'),
                    height: 180,
                    currentWeight: 85,
                    targetWeight: 82,
                    activityLevel: ActivityLevel.VERY_ACTIVE,
                    fitnessGoal: FitnessGoal.GAIN_MUSCLE,
                    bmi: 26.2,
                    bmr: 1850,
                    tdee: 2800,
                    targetCalories: 2600,
                    targetProtein: 180,
                    targetCarbs: 250,
                    targetFats: 80,
                    useCustomTargets: false,
                },
            },
            trainerProfile: {
                create: {
                    bio: 'Certified personal trainer with 10+ years of experience in strength training and nutrition coaching.',
                    specializations: [
                        'Strength Training',
                        'Bodybuilding',
                        'Nutrition Coaching',
                        'Weight Loss',
                        'HIIT',
                    ],
                    certifications: [
                        'NASM Certified Personal Trainer',
                        'ACE Fitness Nutrition Specialist',
                        'CrossFit Level 2 Trainer',
                    ],
                    yearsExperience: 10,
                    hourlyRate: 75.0,
                    isVerified: true,
                    isAcceptingClients: true,
                },
            },
        },
    })

    console.log('✅ Created Trainer:', trainer.email)

    // Create a regular user for testing
    const user = await prisma.user.upsert({
        where: { email: 'user@fitness.com' },
        update: {},
        create: {
            email: 'user@fitness.com',
            name: 'Test User',
            password: hashedPassword,
            role: Role.USER,
            emailVerified: new Date(),
            profile: {
                create: {
                    gender: Gender.FEMALE,
                    dateOfBirth: new Date('1995-08-20'),
                    height: 165,
                    currentWeight: 65,
                    targetWeight: 60,
                    activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
                    fitnessGoal: FitnessGoal.LOSE_WEIGHT,
                    bmi: 23.9,
                    bmr: 1350,
                    tdee: 1800,
                    targetCalories: 1500,
                    targetProtein: 100,
                    targetCarbs: 150,
                    targetFats: 50,
                    useCustomTargets: false,
                },
            },
        },
    })

    console.log('✅ Created User:', user.email)

    console.log('\n📋 Summary:')
    console.log('━'.repeat(50))
    console.log('Admin Account:')
    console.log('  Email: admin@fitness.com')
    console.log('  Password: admin123')
    console.log('  Role: ADMIN')
    console.log('')
    console.log('Trainer Account:')
    console.log('  Email: trainer@fitness.com')
    console.log('  Password: admin123')
    console.log('  Role: TRAINER')
    console.log('')
    console.log('User Account:')
    console.log('  Email: user@fitness.com')
    console.log('  Password: admin123')
    console.log('  Role: USER')
    console.log('━'.repeat(50))
}

main()
    .catch((e) => {
        console.error('❌ Error seeding users:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
