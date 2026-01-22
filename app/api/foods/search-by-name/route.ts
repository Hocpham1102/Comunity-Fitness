import { NextRequest, NextResponse } from 'next/server'
import { searchFoodNutrition, getBestNutritionMatch } from '@/lib/server/services/hybrid-nutrition.service'

/**
 * GET /api/foods/search-by-name
 * Search for food nutrition by name using hybrid approach
 * Query params:
 *   - q: food name to search
 *   - best: if true, return only the best match
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')
        const bestOnly = searchParams.get('best') === 'true'

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required' },
                { status: 400 }
            )
        }

        if (bestOnly) {
            // Return single best match
            const result = await getBestNutritionMatch(query)

            if (!result) {
                return NextResponse.json(
                    { error: 'No nutrition data found for this food' },
                    { status: 404 }
                )
            }

            return NextResponse.json(result)
        } else {
            // Return all matches
            const results = await searchFoodNutrition(query)

            return NextResponse.json({
                items: results,
                total: results.length,
                query,
            })
        }
    } catch (error) {
        console.error('Error in search-by-name API:', error)
        return NextResponse.json(
            { error: 'Failed to search for food nutrition' },
            { status: 500 }
        )
    }
}
