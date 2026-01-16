import { db } from '../lib/server/db/prisma'

async function testVolumeCalculation() {
    console.log('🔍 Testing Total Volume Calculation...\n')

    // Get the first user
    const user = await db.user.findFirst()
    if (!user) {
        console.log('❌ No users found in database')
        return
    }

    console.log(`✅ Testing for user: ${user.email}\n`)

    // Fetch completed workouts with the EXACT same query as computeWorkoutStats
    const logs = await db.workoutLog.findMany({
        where: {
            userId: user.id,
            completedAt: { not: null },
        },
        select: {
            id: true,
            title: true,
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

    console.log(`📊 Found ${logs.length} completed workouts\n`)

    if (logs.length === 0) {
        console.log('❌ No completed workouts found')
        return
    }

    // Calculate total volume using the EXACT same logic
    let totalVolume = 0

    logs.forEach((log, logIndex) => {
        console.log(`\n📝 Workout ${logIndex + 1}: ${log.title}`)
        console.log(`   ID: ${log.id}`)
        console.log(`   Completed: ${log.completedAt}`)
        console.log(`   Exercise Logs: ${log.exerciseLogs.length}`)

        let workoutVolume = 0

        log.exerciseLogs.forEach((exerciseLog, exIndex) => {
            console.log(`   \n   Exercise ${exIndex + 1}:`)
            console.log(`      Sets: ${exerciseLog.sets.length}`)

            let exerciseVolume = 0

            exerciseLog.sets.forEach((set, setIndex) => {
                const setVolume = (set.weight || 0) * (set.reps || 0)
                exerciseVolume += setVolume
                console.log(`      Set ${setIndex + 1}: ${set.weight}kg × ${set.reps} reps = ${setVolume}kg`)
            })

            workoutVolume += exerciseVolume
            console.log(`      Exercise Volume: ${exerciseVolume}kg`)
        })

        totalVolume += workoutVolume
        console.log(`   Workout Total Volume: ${workoutVolume}kg`)
    })

    console.log(`\n\n🎯 TOTAL VOLUME: ${totalVolume}kg`)
    console.log(`📊 Display value: ${Math.round(totalVolume / 1000)}k\n`)
}

testVolumeCalculation()
    .then(() => {
        console.log('✅ Test completed')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
