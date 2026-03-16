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

        const order = await db.order.findUnique({
            where: { id: orderId }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        if (order.status !== 'PENDING') {
            return NextResponse.json({ error: 'Order is not in PENDING state' }, { status: 400 })
        }

        await db.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        })

        // Notify user about order cancellation
        await createNotification({
            userId: order.userId,
            type: 'SYSTEM',
            title: 'Order Declined',
            message: `Your payment order has been declined. Please contact support for more details.`,
            link: '/my-courses',
        })

        revalidatePath('/admin/orders')
        return NextResponse.redirect(new URL('/admin/orders', req.url), 303)
    } catch (error) {
        console.error('Cancel order error:', error)
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }
}
