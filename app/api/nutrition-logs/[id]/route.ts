import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateNutritionLog, deleteNutritionLog } from '@/lib/server/services/nutrition-logs.service'

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
        const log = await updateNutritionLog(id, session.user.id, data)

        if (!log) {
            return NextResponse.json({ error: 'Nutrition log not found' }, { status: 404 })
        }

        return NextResponse.json(log)
    } catch (error) {
        console.error('Error updating nutrition log:', error)
        return NextResponse.json({ error: 'Failed to update nutrition log' }, { status: 500 })
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
        const success = await deleteNutritionLog(id, session.user.id)

        if (!success) {
            return NextResponse.json({ error: 'Nutrition log not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting nutrition log:', error)
        return NextResponse.json({ error: 'Failed to delete nutrition log' }, { status: 500 })
    }
}
