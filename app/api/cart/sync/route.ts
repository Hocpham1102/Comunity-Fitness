import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'

// Fetch the user's cart from the database
export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ items: [] })
        }

        const cart = await (db as any).cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        course: {
                            include: { trainer: { select: { name: true } } }
                        }
                    }
                }
            }
        })

        if (!cart) {
            return NextResponse.json({ items: [] })
        }

        // Filter out enrolled 
        const enrolled = await db.courseEnrollment.findMany({
            where: {
                userId: session.user.id,
                courseId: { in: cart.items.map((i: any) => i.courseId) }
            },
            select: { courseId: true }
        })
        const enrolledCourseIds = new Set(enrolled.map((e: any) => e.courseId))

        // Transform to CartItem format used by Zustand
        const items = cart.items
            .filter((item: any) => !enrolledCourseIds.has(item.courseId))
            .map((item: any) => ({
                id: item.course.id,
                title: item.course.title,
                price: item.course.price,
                currency: item.course.currency,
                thumbnailUrl: item.course.thumbnailUrl,
                trainerName: item.course.trainer?.name || null
            }))

        return NextResponse.json({ items })
    } catch (error) {
        console.error('Fetch cart error:', error)
        return NextResponse.json({ items: [] }, { status: 500 })
    }
}

// Update the user's cart in the database (overwrite with frontend state)
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { items } = await req.json()
        const userId = session.user.id

        // Ensure cart exists
        let cart = await (db as any).cart.findUnique({ where: { userId } })
        if (!cart) {
            cart = await (db as any).cart.create({ data: { userId } })
        }

        // Run in transaction: delete old items, insert new items
        await db.$transaction(async (tx) => {
            // 1. Delete existing items
            await (tx as any).cartItem.deleteMany({
                where: { cartId: cart!.id }
            })

            // 2. Insert new items if any
            if (items && items.length > 0) {
                // Dedup locally just in case
                const uniqueCourseIds = Array.from(new Set(items.map((i: any) => i.id))) as string[]

                // Ensure courses actually exist in db 
                const validCourses = await tx.course.findMany({
                    where: { id: { in: uniqueCourseIds } },
                    select: { id: true }
                })
                const validCourseIds = new Set(validCourses.map(c => c.id))

                // Ensure user is not already enrolled
                const enrolled = await tx.courseEnrollment.findMany({
                    where: {
                        userId,
                        courseId: { in: uniqueCourseIds }
                    },
                    select: { courseId: true }
                })
                const enrolledCourseIds = new Set(enrolled.map(e => e.courseId))

                const cartItemsToCreate = uniqueCourseIds
                    .filter(id => validCourseIds.has(id))
                    .filter(id => !enrolledCourseIds.has(id))
                    .map(courseId => ({
                        cartId: cart!.id,
                        courseId
                    }))

                if (cartItemsToCreate.length > 0) {
                    await (tx as any).cartItem.createMany({
                        data: cartItemsToCreate
                    })
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Sync cart error:', error)
        return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
    }
}
