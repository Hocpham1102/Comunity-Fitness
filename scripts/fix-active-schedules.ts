/**
 * One-time fix: đảm bảo mỗi user chỉ có đúng 1 MealSchedule có isActive = true.
 * Giữ lại cái mới nhất (createdAt desc) là active, set toàn bộ cái còn lại thành false.
 * Chạy: npx tsx scripts/fix-active-schedules.ts
 */
import { db } from '../lib/server/db/prisma'

async function main() {
    // Lấy tất cả users có ít nhất 1 schedule active
    const schedules = await db.mealSchedule.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, userId: true, name: true, isActive: true, createdAt: true },
    })

    // Nhóm theo userId
    const byUser: Record<string, typeof schedules> = {}
    for (const s of schedules) {
        if (!byUser[s.userId]) byUser[s.userId] = []
        byUser[s.userId].push(s)
    }

    let fixed = 0
    for (const [userId, userSchedules] of Object.entries(byUser)) {
        const activeOnes = userSchedules.filter(s => s.isActive)
        if (activeOnes.length <= 1) continue // OK

        // Giữ cái đầu tiên (mới nhất vì đã sort desc), set còn lại = false
        const keepActive = activeOnes[0]
        const setInactive = activeOnes.slice(1).map(s => s.id)

        console.log(`User ${userId}: ${activeOnes.length} active schedules → giữ "${keepActive.name}" (${keepActive.id}), unset ${setInactive.length} cái còn lại`)

        await db.mealSchedule.updateMany({
            where: { id: { in: setInactive } },
            data: { isActive: false },
        })
        fixed += setInactive.length
    }

    if (fixed === 0) {
        console.log('✅ Tất cả users đều có đúng 1 active schedule.')
    } else {
        console.log(`✅ Đã fix ${fixed} schedule(s).`)
    }

    await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
