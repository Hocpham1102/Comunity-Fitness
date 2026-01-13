import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { getAdminStats } from '@/lib/server/services/admin.service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const stats = await getAdminStats()

        return NextResponse.json(stats, { status: 200 })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
