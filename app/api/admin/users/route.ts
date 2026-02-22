import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/server/auth/session'
import { db } from '@/lib/server/db/prisma'
import { hash } from 'bcryptjs'
import { Prisma, Role } from '@prisma/client'

export async function GET(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get('page') ?? '1')
        const pageSize = Number(searchParams.get('pageSize') ?? '20')
        const search = searchParams.get('search') ?? ''
        const role = searchParams.get('role') ?? ''
        const emailVerified = searchParams.get('emailVerified') ?? ''
        const sortBy = searchParams.get('sortBy') ?? 'createdAt'
        const sortOrder = searchParams.get('sortOrder') ?? 'desc'

        const skip = (page - 1) * pageSize

        // Build where clause
        const where: Prisma.UserWhereInput = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (role && ['USER', 'TRAINER', 'ADMIN'].includes(role)) {
            where.role = role as Role
        }

        if (emailVerified === 'true') {
            where.emailVerified = { not: null }
        } else if (emailVerified === 'false') {
            where.emailVerified = null
        }

        // Build orderBy clause
        const orderBy: Prisma.UserOrderByWithRelationInput = {}
        if (sortBy === 'name' || sortBy === 'email' || sortBy === 'createdAt') {
            orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'
        } else {
            orderBy.createdAt = 'desc'
        }

        const [items, total] = await Promise.all([
            db.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    emailVerified: true,
                    image: true,
                    _count: {
                        select: {
                            workoutLogs: true,
                            nutritionLogs: true,
                            assignedClients: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: pageSize,
            }),
            db.user.count({ where }),
        ])

        return NextResponse.json({ items, total, page, pageSize }, { status: 200 })
    } catch (error) {
        console.error('Admin users list error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { user } = await verifySession()

        // Only admins can access this endpoint
        if (user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { name, email, password, role } = body

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        if (!['USER', 'TRAINER', 'ADMIN'].includes(role)) {
            return NextResponse.json(
                { message: 'Invalid role' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user
        const newUser = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role,
                emailVerified: new Date(), // Auto-verify admin-created users
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                emailVerified: true,
            },
        })

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('Admin create user error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
