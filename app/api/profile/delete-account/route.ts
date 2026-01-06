import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import { signOut } from '@/auth'

export async function DELETE(request: NextRequest) {
    try {
        // Get authenticated user session
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Delete user account (cascade will delete related data)
        await db.user.delete({
            where: { id: session.user.id },
        })

        return NextResponse.json({
            message: 'Account deleted successfully',
        })
    } catch (error) {
        console.error('Account deletion error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
