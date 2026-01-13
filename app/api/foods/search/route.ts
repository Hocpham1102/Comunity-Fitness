import { NextRequest, NextResponse } from 'next/server'
import { searchFoods } from '@/lib/server/services/foods.service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const q = searchParams.get('q') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')

        const result = await searchFoods({ q, page, pageSize, isPublic: true })
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error searching foods:', error)
        return NextResponse.json({ error: 'Failed to search foods' }, { status: 500 })
    }
}
