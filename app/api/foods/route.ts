import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { searchFoods, createFood } from '@/lib/server/services/foods.service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const q = searchParams.get('q') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const isPublic = searchParams.get('isPublic') === 'true' ? true : undefined

        const result = await searchFoods({ q, page, pageSize, isPublic })
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching foods:', error)
        return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Only admins can create foods
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const data = await request.json()
        const food = await createFood(data, session.user.id)
        return NextResponse.json(food, { status: 201 })
    } catch (error) {
        console.error('Error creating food:', error)
        return NextResponse.json({ error: 'Failed to create food' }, { status: 500 })
    }
}
