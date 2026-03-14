import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/server/db/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { items } = await req.json()
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
        }

        const userId = session.user.id

        // Validate that courses exist and calculate total securely on the backend
        const courseIds = items.map((item: { id: string }) => item.id)
        const courses = await prisma.course.findMany({
            where: {
                id: { in: courseIds },
                isPublished: true
            }
        })

        if (courses.length !== items.length) {
            return NextResponse.json({ error: 'Some courses are invalid or no longer available' }, { status: 400 })
        }

        // Check if user is already enrolled in any of these courses
        const existingEnrollments = await prisma.courseEnrollment.findMany({
            where: {
                userId,
                courseId: { in: courseIds }
            }
        })

        if (existingEnrollments.length > 0) {
            return NextResponse.json({
                error: 'You are already enrolled in some of these courses',
                alreadyEnrolledCourseIds: existingEnrollments.map((e: { courseId: string }) => e.courseId)
            }, { status: 400 })
        }

        const totalAmount = courses.reduce((sum: number, course: { price: number }) => sum + course.price, 0)
        const currency = courses[0]?.currency || 'VND'

        // If all courses are free, auto-complete order and enroll immediately
        const allFree = courses.every((c: { price: number }) => c.price === 0)

        if (allFree) {
            const order = await (prisma as any).order.create({
                data: {
                    userId,
                    totalAmount: 0,
                    currency,
                    status: 'COMPLETED',
                    paymentMethod: 'VIETQR',
                    items: {
                        create: courses.map((course: { id: string; price: number; currency: string }) => ({
                            courseId: course.id,
                            price: 0,
                            currency: course.currency
                        }))
                    }
                }
            })

            // Auto-enroll user in all free courses
            await prisma.courseEnrollment.createMany({
                data: courses.map((course: { id: string }) => ({
                    userId,
                    courseId: course.id,
                    progress: 0,
                })),
                skipDuplicates: true,
            })

            return NextResponse.json({
                success: true,
                orderId: order.id,
                totalAmount: 0,
                currency,
                autoEnrolled: true,
                enrolledCourseIds: courses.map((c: { id: string }) => c.id),
            })
        }

        // Paid courses: create PENDING order, wait for admin approval
        const order = await (prisma as any).order.create({
            data: {
                userId,
                totalAmount,
                currency,
                status: 'PENDING',
                paymentMethod: 'VIETQR',
                items: {
                    create: courses.map((course: { id: string; price: number; currency: string }) => ({
                        courseId: course.id,
                        price: course.price,
                        currency: course.currency
                    }))
                }
            }
        })

        return NextResponse.json({
            success: true,
            orderId: order.id,
            totalAmount: order.totalAmount,
            currency: order.currency
        })

    } catch (error: any) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 })
    }
}
