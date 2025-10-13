import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db/prisma'
import { registerSchema } from '@/lib/shared/schemas/auth.schema'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = registerSchema.parse(body)
    const { name, email, password, role } = validatedData
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password on the server
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user and profile in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      // Create empty profile for easier onboarding
      await tx.profile.create({
        data: {
          userId: user.id,
        },
      })

      return user
    })

    return NextResponse.json(
      { message: 'User created successfully', user: result },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
