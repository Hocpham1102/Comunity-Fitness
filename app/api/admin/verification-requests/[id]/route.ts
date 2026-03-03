import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// PATCH - approve or reject a verification request
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { action, adminNote } = await req.json() // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const request = await db.trainerVerificationRequest.findUnique({ where: { id: params.id } })
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    // Update the verification request
    const updated = await db.trainerVerificationRequest.update({
        where: { id: params.id },
        data: {
            status: newStatus,
            adminNote: adminNote ?? null,
            reviewedAt: new Date(),
            reviewedById: session.user.id,
        },
    })

    // If approved, set TrainerProfile.isVerified = true
    if (action === 'approve') {
        await db.trainerProfile.upsert({
            where: { userId: request.trainerId },
            create: {
                userId: request.trainerId,
                bio: request.bio,
                specializations: request.specializations,
                certifications: request.certifications,
                yearsExperience: request.yearsExperience,
                isVerified: true,
            },
            update: {
                isVerified: true,
            },
        })
    }

    // Create a notification for the trainer
    await db.notification.create({
        data: {
            userId: request.trainerId,
            type: 'SYSTEM',
            title: action === 'approve' ? '🎉 Verification Approved!' : 'Verification Request Rejected',
            message:
                action === 'approve'
                    ? 'Your trainer verification has been approved. You can now access all service-selling features.'
                    : `Your verification request was rejected. ${adminNote ? `Reason: ${adminNote}` : 'Please review and resubmit.'}`,
        },
    })

    return NextResponse.json({ request: updated })
}
