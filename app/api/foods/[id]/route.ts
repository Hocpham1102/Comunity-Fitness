import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getFoodById, updateFood, deleteFood } from '@/lib/server/services/foods.service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const food = await getFoodById(id)

        if (!food) {
            return NextResponse.json({ error: 'Food not found' }, { status: 404 })
        }

        return NextResponse.json(food)
    } catch (error) {
        console.error('Error fetching food:', error)
        return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()
        const food = await updateFood(id, data, session.user.role)

        if (!food) {
            return NextResponse.json({ error: 'Food not found or forbidden' }, { status: 404 })
        }

        return NextResponse.json(food)
    } catch (error) {
        console.error('Error updating food:', error)
        return NextResponse.json({ error: 'Failed to update food' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const success = await deleteFood(id, session.user.role)

        if (!success) {
            return NextResponse.json({ error: 'Food not found or forbidden' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting food:', error)
        return NextResponse.json({ error: 'Failed to delete food' }, { status: 500 })
    }
}
