import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user is a trainer or admin
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!user || (user.role !== 'TRAINER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get total active clients
        const activeClients = await db.trainerClient.count({
            where: {
                trainerId: session.user.id,
                status: 'ACTIVE',
            },
        })

        // Get total courses
        const totalCourses = await db.course.count({
            where: {
                trainerId: session.user.id,
            },
        })

        // Get published courses
        const publishedCourses = await db.course.count({
            where: {
                trainerId: session.user.id,
                isPublished: true,
            },
        })

        // Get total course enrollments
        const courseEnrollments = await db.courseEnrollment.count({
            where: {
                course: {
                    trainerId: session.user.id,
                },
            },
        })

        // Get total revenue from courses (if purchases are tracked)
        const revenue = await db.purchase.aggregate({
            where: {
                product: {
                    type: 'COACHING_PACKAGE',
                },
            },
            _sum: {
                amount: true,
            },
        })

        // Get recent client activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentWorkouts = await db.workoutLog.count({
            where: {
                user: {
                    assignedTrainers: {
                        some: {
                            trainerId: session.user.id,
                            status: 'ACTIVE',
                        },
                    },
                },
                startedAt: {
                    gte: sevenDaysAgo,
                },
            },
        })

        // Get new clients this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const newClientsThisMonth = await db.trainerClient.count({
            where: {
                trainerId: session.user.id,
                createdAt: {
                    gte: startOfMonth,
                },
            },
        })

        return NextResponse.json({
            activeClients,
            totalCourses,
            publishedCourses,
            courseEnrollments,
            totalRevenue: revenue._sum.amount || 0,
            recentWorkouts,
            newClientsThisMonth,
        })
    } catch (error) {
        console.error('Error fetching trainer stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
