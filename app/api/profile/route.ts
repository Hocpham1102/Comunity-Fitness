import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user session
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch user data with profile
        const user = await db.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phoneNumber: true,
                role: true,
                profile: {
                    select: {
                        dateOfBirth: true,
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
            },
        })

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            phoneNumber: user.phoneNumber,
            role: user.role,
            dateOfBirth: user.profile?.dateOfBirth,
            gender: user.profile?.gender,
            height: user.profile?.height,
            currentWeight: user.profile?.currentWeight,
            targetWeight: user.profile?.targetWeight,
            activityLevel: user.profile?.activityLevel,
            fitnessGoal: user.profile?.fitnessGoal,
            bmi: user.profile?.bmi,
            bmr: user.profile?.bmr,
            tdee: user.profile?.tdee,
        })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user session
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get current user to check role
        const currentUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        // Parse request body
        const body = await request.json()
        const {
            // Account information fields
            fullName,
            email,
            phoneNumber,
            accountType,
            // Fitness profile fields
            dateOfBirth,
            gender,
            height,
            currentWeight,
            targetWeight,
            activityLevel,
            fitnessGoal,
            bmi,
            bmr,
            tdee
        } = body

        // Prepare user update data (account information)
        const userUpdateData: any = {}

        if (fullName !== undefined) userUpdateData.name = fullName
        if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber

        // Handle email update with uniqueness check
        if (email !== undefined && email !== session.user.email) {
            const existingUser = await db.user.findUnique({
                where: { email }
            })

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json(
                    { message: 'Email already exists' },
                    { status: 409 }
                )
            }

            userUpdateData.email = email
        }

        // Handle account type (role) update - only admins can change this
        if (accountType !== undefined) {
            if (currentUser?.role === 'ADMIN') {
                userUpdateData.role = accountType.toUpperCase()
            }
            // Non-admins cannot change their own role, silently ignore
        }

        // Update user account information if there are changes
        if (Object.keys(userUpdateData).length > 0) {
            await db.user.update({
                where: { id: session.user.id },
                data: userUpdateData
            })
        }

        // Prepare profile update data (fitness information)
        const profileUpdateData: any = {}

        if (dateOfBirth) profileUpdateData.dateOfBirth = new Date(dateOfBirth)
        if (gender) profileUpdateData.gender = gender
        if (height !== null && height !== undefined) profileUpdateData.height = parseFloat(height)
        if (currentWeight !== null && currentWeight !== undefined) profileUpdateData.currentWeight = parseFloat(currentWeight)
        if (targetWeight !== null && targetWeight !== undefined) profileUpdateData.targetWeight = parseFloat(targetWeight)
        if (activityLevel) profileUpdateData.activityLevel = activityLevel
        if (fitnessGoal) profileUpdateData.fitnessGoal = fitnessGoal
        if (bmi !== null && bmi !== undefined) profileUpdateData.bmi = parseFloat(bmi)
        if (bmr !== null && bmr !== undefined) profileUpdateData.bmr = parseFloat(bmr)
        if (tdee !== null && tdee !== undefined) profileUpdateData.tdee = parseFloat(tdee)

        // Update or create profile with all fitness data if there are changes
        let updatedProfile = null
        if (Object.keys(profileUpdateData).length > 0) {
            updatedProfile = await db.profile.upsert({
                where: { userId: session.user.id },
                update: profileUpdateData,
                create: {
                    userId: session.user.id,
                    ...profileUpdateData,
                },
                select: {
                    dateOfBirth: true,
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
            })
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updatedProfile,
        })
    } catch (error: any) {
        console.error('Profile update error:', error)

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

