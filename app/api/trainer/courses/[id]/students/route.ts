import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

/**
 * GET /api/trainer/courses/[id]/students
 * Get all students enrolled in a specific course.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user is trainer or admin
        const currentUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!currentUser || (currentUser.role !== 'TRAINER' && currentUser.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id: courseId } = await params

        // Verify the course belongs to this trainer
        const course = await db.course.findUnique({
            where: { id: courseId, trainerId: session.user.id },
            select: { id: true, title: true }
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 })
        }

        // Fetch students enrolled in the course and their relationship with the trainer
        const enrollments = await db.courseEnrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        assignedTrainers: {
                            where: { trainerId: session.user.id }
                        }
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' },
        })

        // Format data
        const students = enrollments.map(e => {
            const relationship = e.user.assignedTrainers[0]
            return {
                id: e.user.id,
                name: e.user.name,
                email: e.user.email,
                image: e.user.image,
                enrolledAt: e.enrolledAt,
                relationship: relationship ? {
                    status: relationship.status,
                    invitedAt: relationship.createdAt
                } : null
            }
        })

        return NextResponse.json({
            course: { id: course.id, title: course.title },
            students
        })
    } catch (error) {
        console.error('Error fetching course students:', error)
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }
}
