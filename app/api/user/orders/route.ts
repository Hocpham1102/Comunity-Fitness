import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/server/db/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const orders = await (prisma as any).order.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                items: {
                    include: {
                        course: {
                            select: {
                                title: true,
                                thumbnailUrl: true,
                                trainer: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ orders })

    } catch (error) {
        console.error('Fetch orders error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
