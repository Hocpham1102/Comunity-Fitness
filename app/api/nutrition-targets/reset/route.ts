import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { resetToAutoTargets } from '@/lib/server/services/nutrition-targets.service'

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const targets = await resetToAutoTargets(session.user.id)

        if (!targets) {
            return NextResponse.json(
                { error: 'Profile incomplete. Please complete your profile with weight, TDEE, and fitness goal.' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            message: 'Targets reset to auto-calculated values',
            targets,
        })
    } catch (error) {
        console.error('Error resetting nutrition targets:', error)
        return NextResponse.json(
            { error: 'Failed to reset nutrition targets' },
            { status: 500 }
        )
    }
}
