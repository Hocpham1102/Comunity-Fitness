import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user session
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { currentPassword, newPassword } = body

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'Current password and new password are required' },
                { status: 400 }
            )
        }

        // Get user with password
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                password: true,
            },
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { message: 'User not found or no password set' },
                { status: 404 }
            )
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Current password is incorrect' },
                { status: 401 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // Update password
        await db.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        })

        return NextResponse.json({
            message: 'Password changed successfully',
        })
    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
