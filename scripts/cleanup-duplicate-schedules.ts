/**
 * One-time cleanup: xóa MealSchedule bị trùng (cùng userId + name + ngày startDate).
 * Giữ lại bản ghi cũ nhất (createdAt asc), xóa các bản sau.
 * Chạy: npx tsx scripts/cleanup-duplicate-schedules.ts
 */
import { db } from '../lib/server/db/prisma'

async function main() {
    const all = await db.mealSchedule.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, userId: true, name: true, startDate: true, createdAt: true },
    })

    const seen = new Map<string, string>()
    const toDelete: string[] = []

    for (const s of all) {
        const key = `${s.userId}|${s.name}|${s.startDate.toISOString().split('T')[0]}`
        if (seen.has(key)) {
            toDelete.push(s.id)
        } else {
            seen.set(key, s.id)
        }
    }

    if (toDelete.length === 0) {
        console.log('✅ Không có bản ghi trùng nào.')
    } else {
        console.log(`🗑️  Xóa ${toDelete.length} schedule(s) bị trùng: ${toDelete.join(', ')}`)
        await db.mealSchedule.deleteMany({ where: { id: { in: toDelete } } })
        console.log('✅ Xóa xong!')
    }

    await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
