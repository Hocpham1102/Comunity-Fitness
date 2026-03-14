import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
    const orders = await prisma.order.findMany({
        include: {
            user: true,
            items: {
                include: { course: true }
            }
        }
    })
    console.log(`Found ${orders.length} orders`)
    let hasError = false
    for (const o of orders) {
        if (!o.user) {
            console.log(`Order ${o.id} has no user!`)
            hasError = true
        }
        for (const item of o.items) {
            if (!item.course) {
                console.log(`Order ${o.id} item ${item.id} has no course! (courseId: ${item.courseId})`)
                hasError = true
            }
        }
    }
    if (!hasError) console.log('All orders have their related user and courses.')
}
check().catch(console.error).finally(() => prisma.$disconnect())
