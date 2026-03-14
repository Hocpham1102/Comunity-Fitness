import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { verifySession } from '@/lib/server/auth/session'

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { user } = await verifySession()
        const { courseId } = await params

        // Verify course exists and is published
        const course = await (db as any).course.findUnique({
            where: { id: courseId, isPublished: true },
            select: { id: true, title: true, price: true },
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        // Check already enrolled
        const existing = await (db as any).courseEnrollment.findUnique({
            where: { courseId_userId: { courseId, userId: user.id } },
        })

        if (existing) {
            return NextResponse.json({ enrolled: true, alreadyEnrolled: true })
        }

        // Create enrollment
        await (db as any).courseEnrollment.create({
            data: {
                courseId,
                userId: user.id,
                progress: 0,
            },
        })

        return NextResponse.json({ enrolled: true, alreadyEnrolled: false }, { status: 201 })
    } catch (error: any) {
        if (error?.message === 'Unauthorized' || error?.status === 401) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.error('Enroll error:', error)
        return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
    }
}
