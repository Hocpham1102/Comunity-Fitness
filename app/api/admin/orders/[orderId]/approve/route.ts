import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/server/services/notification.service'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = await params

        // Fetch the order with items
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        if (order.status !== 'PENDING') {
            return NextResponse.json({ error: 'Order is not in PENDING state' }, { status: 400 })
        }

        // Wrap in transaction: update order status, enroll user in courses
        await db.$transaction(async (tx) => {
            // 1. Update order
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            })

            // 2. Create enrollments (filter out if they already exist just in case)
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

        // Notify user about order approval
        await createNotification({
            userId: order.userId,
            type: 'SYSTEM',
            title: 'Order Approved',
            message: `Your payment has been confirmed. You can now start learning.`,
            link: '/my-courses',
        })

        // Notify trainers about new enrollments
        for (const item of order.items) {
            const course = await db.course.findUnique({
                where: { id: item.courseId },
                select: { title: true, trainerId: true }
            })
            if (course?.trainerId) {
                await createNotification({
                    userId: course.trainerId,
                    type: 'SYSTEM',
                    title: 'New Student',
                    message: `A new student has enrolled in your course "${course.title}".`,
                    link: '/trainer/courses',
                })
            }
        }

        revalidatePath('/admin/orders')
        // We redirect back to the orders page since this is called from a form action
        return NextResponse.redirect(new URL('/admin/orders', req.url), 303)
    } catch (error) {
        console.error('Approve order error:', error)
        return NextResponse.json({ error: 'Failed to approve order' }, { status: 500 })
    }
}
