import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'TRAINER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const profile = await db.trainerProfile.findUnique({
        where: { userId: session.user.id },
    })

    return NextResponse.json({ profile })
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'TRAINER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const {
        bio,
        specializations,
        certifications,
        yearsExperience,
        hourlyRate,
        instagramUrl,
        twitterUrl,
        websiteUrl,
        isAcceptingClients,
    } = body

    const data: any = {}
    if (bio !== undefined) data.bio = bio
    if (specializations !== undefined) data.specializations = specializations
    if (certifications !== undefined) data.certifications = certifications
    if (yearsExperience !== undefined) data.yearsExperience = yearsExperience !== '' ? Number(yearsExperience) : null
    if (hourlyRate !== undefined) data.hourlyRate = hourlyRate !== '' ? Number(hourlyRate) : null
    if (instagramUrl !== undefined) data.instagramUrl = instagramUrl || null
    if (twitterUrl !== undefined) data.twitterUrl = twitterUrl || null
    if (websiteUrl !== undefined) data.websiteUrl = websiteUrl || null
    if (isAcceptingClients !== undefined) data.isAcceptingClients = isAcceptingClients

    const profile = await db.trainerProfile.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...data },
        update: data,
    })

    return NextResponse.json({ profile })
}
