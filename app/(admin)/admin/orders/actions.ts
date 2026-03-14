'use server'

import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function approveOrder(orderId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    // Fetch the order with items
    const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    })

    if (!order) {
        throw new Error('Order not found')
    }

    if (order.status !== 'PENDING') {
        throw new Error('Order is not in PENDING state')
    }

    // Wrap in transaction: update order status, enroll user in courses, pay trainers
    await db.$transaction(async (tx) => {
        // 1. Update order
        await tx.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' }
        })

        // 2. Distribute funds to trainers
        const PLATFORM_FEE_PERCENTAGE = 0.10

        // Process each item in the order
        for (const item of order.items) {
            if (!item.courseId) continue

            // We need the trainerId for this course
            const course = await tx.course.findUnique({
                where: { id: item.courseId },
                select: { id: true, trainerId: true }
            })

            if (course && course.trainerId) {
                const itemPrice = item.price
                const trainerShare = itemPrice * (1 - PLATFORM_FEE_PERCENTAGE)

                // Update Trainer's Wallet Balance
                const profile = await tx.trainerProfile.upsert({
                    where: { userId: course.trainerId },
                    update: {
                        walletBalance: { increment: trainerShare }
                    },
                    create: {
                        userId: course.trainerId,
                        walletBalance: trainerShare
                    }
                })

                // Log the Earning Transaction
                await tx.transaction.create({
                    data: {
                        userId: course.trainerId,
                        amount: trainerShare,
                        type: 'EARNING',
                        status: 'COMPLETED',
                        description: `Earnings from Order #${order.id.slice(-6).toUpperCase()} - Course: ${course.id}`,
                        referenceId: order.id
                    }
                })
            }
        }

        // 3. Create enrollments (filter out if they already exist just in case)
        const existingEnrollments = await tx.courseEnrollment.findMany({
            where: {
                userId: order.userId,
                courseId: { in: order.items.map(i => i.courseId) }
            }
        })

        const existingCourseIds = new Set(existingEnrollments.map(e => e.courseId))

        const newEnrollments = order.items
            .filter(i => !existingCourseIds.has(i.courseId))
            .map(i => ({
                userId: order.userId,
                courseId: i.courseId,
            }))

        if (newEnrollments.length > 0) {
            await tx.courseEnrollment.createMany({
                data: newEnrollments
            })
        }
    })

    revalidatePath('/admin/orders')
}

export async function cancelOrder(orderId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const order = await db.order.findUnique({
        where: { id: orderId }
    })

    if (!order) {
        throw new Error('Order not found')
    }

    if (order.status !== 'PENDING') {
        throw new Error('Order is not in PENDING state')
    }

    await db.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
    })

    revalidatePath('/admin/orders')
}
