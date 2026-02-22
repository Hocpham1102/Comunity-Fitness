import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { Role } from '@prisma/client'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        const targetUser = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true,
                image: true,
                phoneNumber: true,
                profile: {
                    select: {
                        gender: true,
                        height: true,
                        currentWeight: true,
                        targetWeight: true,
                        activityLevel: true,
                        fitnessGoal: true,
                        bmi: true,
                        bmr: true,
                        tdee: true,
                    },
                },
                trainerProfile: {
                    select: {
                        bio: true,
                        specializations: true,
                        certifications: true,
                        yearsExperience: true,
                        isVerified: true,
                        isAcceptingClients: true,
                    },
                },
                _count: {
                    select: {
                        workoutLogs: true,
                        nutritionLogs: true,
                        assignedClients: true,
                        assignedTrainers: true,
                        createdWorkouts: true,
                        createdCourses: true,
                    },
                },
            },
        })

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(targetUser, { status: 200 })
    } catch (error) {
        console.error('Admin get user error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, email, role, phoneNumber } = body

        // Validation
        if (role && !['USER', 'TRAINER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { id },
        })

        if (!existingUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // If email is being changed, check if it's already taken
        if (email && email !== existingUser.email) {
            const emailTaken = await db.user.findUnique({
                where: { email },
            })

            if (emailTaken) {
                return NextResponse.json(
                    { message: 'Email already in use' },
                    { status: 409 }
                )
            }
        }

        // Update user
        const updatedUser = await db.user.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(role !== undefined && { role: role as Role }),
                ...(phoneNumber !== undefined && { phoneNumber }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                emailVerified: true,
                phoneNumber: true,
            },
        })

        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error) {
        console.error('Admin update user error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        // Prevent admin from deleting themselves
        if (id === user.id) {
            return NextResponse.json(
                { message: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { id },
        })

        if (!existingUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Delete user (cascade will handle related records)
        await db.user.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Admin delete user error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
