import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// GET - fetch current trainer's verification request
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'TRAINER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [request, trainerProfile] = await Promise.all([
        db.trainerVerificationRequest.findUnique({
            where: { trainerId: session.user.id },
        }),
        db.trainerProfile.findUnique({
            where: { userId: session.user.id },
            select: { isVerified: true },
        }),
    ])

    return NextResponse.json({
        request,
        isVerified: trainerProfile?.isVerified ?? false,
    })
}

// POST - submit / resubmit a verification request
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'TRAINER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { fullName, phoneNumber, yearsExperience, specializations, certifications, bio, certificateUrl, socialLinks } = body

    if (!fullName || !phoneNumber || !bio || yearsExperience === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Block resubmission if status is PENDING
    const existing = await db.trainerVerificationRequest.findUnique({
        where: { trainerId: session.user.id },
    })
    if (existing?.status === 'PENDING') {
        return NextResponse.json({ error: 'You already have a pending verification request' }, { status: 409 })
    }

    const request = await db.trainerVerificationRequest.upsert({
        where: { trainerId: session.user.id },
        create: {
            trainerId: session.user.id,
            fullName,
            phoneNumber,
            yearsExperience: Number(yearsExperience),
            specializations: specializations ?? [],
            certifications: certifications ?? [],
            bio,
            certificateUrl: certificateUrl ?? null,
            socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
            status: 'PENDING',
            submittedAt: new Date(),
            adminNote: null,
            reviewedAt: null,
            reviewedById: null,
        },
        update: {
            fullName,
            phoneNumber,
            yearsExperience: Number(yearsExperience),
            specializations: specializations ?? [],
            certifications: certifications ?? [],
            bio,
            certificateUrl: certificateUrl ?? null,
            socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
            status: 'PENDING',
            submittedAt: new Date(),
            adminNote: null,
            reviewedAt: null,
            reviewedById: null,
        },
    })

    return NextResponse.json({ request }, { status: 201 })
}
