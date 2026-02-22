import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { action, userIds, role } = body

        if (!action || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { message: 'Invalid request: action and userIds are required' },
                { status: 400 }
            )
        }

        // Prevent admin from performing bulk actions on themselves
        if (userIds.includes(user.id)) {
            return NextResponse.json(
                { message: 'Cannot perform bulk actions on your own account' },
                { status: 400 }
            )
        }

        let result

        switch (action) {
            case 'delete':
                result = await db.user.deleteMany({
                    where: {
                        id: { in: userIds },
                    },
                })
                return NextResponse.json(
                    { message: `${result.count} users deleted successfully`, count: result.count },
                    { status: 200 }
                )

            case 'changeRole':
                if (!role || !['USER', 'TRAINER', 'ADMIN'].includes(role)) {
                    return NextResponse.json(
                        { message: 'Invalid role' },
                        { status: 400 }
                    )
                }

                result = await db.user.updateMany({
                    where: {
                        id: { in: userIds },
                    },
                    data: {
                        role: role as Role,
                    },
                })
                return NextResponse.json(
                    { message: `${result.count} users updated successfully`, count: result.count },
                    { status: 200 }
                )

            case 'verifyEmail':
                result = await db.user.updateMany({
                    where: {
                        id: { in: userIds },
                        emailVerified: null,
                    },
                    data: {
                        emailVerified: new Date(),
                    },
                })
                return NextResponse.json(
                    { message: `${result.count} users verified successfully`, count: result.count },
                    { status: 200 }
                )

            default:
                return NextResponse.json(
                    { message: 'Invalid action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Admin bulk users error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
