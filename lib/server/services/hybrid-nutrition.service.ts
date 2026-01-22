/**
 * Hybrid Nutrition Lookup Service
 * Two-tier strategy: Database → AI Estimation
 */

import { searchFoods, createFood } from './foods.service'
import { estimateNutrition } from './ai-nutrition.service'

export interface NutritionResult {
    id?: string // Only present if from database
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber?: number
    sugar?: number
    servingSize?: number
    servingUnit?: string
    source: 'DATABASE' | 'AI_ESTIMATE'
    confidence?: 'high' | 'medium' | 'low'
    isNew?: boolean // True if this was just added to database
}

/**
 * Search for food nutrition using hybrid approach
 * 1. Try local database first
 * 2. If not found, use AI estimation
 * 3. Save AI results to database for future use
 */
export async function searchFoodNutrition(query: string): Promise<NutritionResult[]> {
    const results: NutritionResult[] = []

    try {
        // TIER 1: Search local database
        console.log(`[Hybrid Search] Tier 1: Searching database for "${query}"`)
        const dbResults = await searchFoods({ q: query, pageSize: 5, isPublic: true })

        if (dbResults.items.length > 0) {
            console.log(`[Hybrid Search] Found ${dbResults.items.length} results in database`)
            results.push(...dbResults.items.map(food => ({
                id: food.id,
                name: food.name,
                description: food.description || '',
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                fiber: food.fiber || undefined,
                sugar: food.sugar || undefined,
                servingSize: food.servingSize || undefined,
                servingUnit: food.servingUnit || undefined,
                source: 'DATABASE' as const,
                confidence: 'high' as const,
            })))

            // If we have good database results, return them
            if (results.length >= 3) {
                return results
            }
        } else {
            console.log(`[Hybrid Search] No results found in database`)
        }
    } catch (error) {
        console.error('[Hybrid Search] Database search error:', error)
    }

    // TIER 2: Use AI estimation
    console.log(`[Hybrid Search] Tier 2: Using AI estimation for "${query}"`)
    try {
        const aiEstimate = await estimateNutrition(query)

        if (aiEstimate) {
            console.log(`[Hybrid Search] AI estimated nutrition for "${query}"`)

            // Save AI estimate to database
            try {
                const savedFood = await createFood({
                    name: aiEstimate.name,
                    description: `${aiEstimate.description} (AI-estimated)`,
                    calories: aiEstimate.calories,
                    protein: aiEstimate.protein,
                    carbs: aiEstimate.carbs,
                    fats: aiEstimate.fats,
                    fiber: aiEstimate.fiber,
                    sugar: aiEstimate.sugar,
                    servingSize: aiEstimate.servingSize,
                    servingUnit: aiEstimate.servingUnit,
                    isPublic: true,
                })

                results.push({
                    id: savedFood.id,
                    name: savedFood.name,
                    description: savedFood.description || '',
                    calories: savedFood.calories,
                    protein: savedFood.protein,
                    carbs: savedFood.carbs,
                    fats: savedFood.fats,
                    fiber: savedFood.fiber || undefined,
                    sugar: savedFood.sugar || undefined,
                    servingSize: savedFood.servingSize || undefined,
                    servingUnit: savedFood.servingUnit || undefined,
                    source: 'AI_ESTIMATE' as const,
                    confidence: aiEstimate.confidence,
                    isNew: true,
                })
            } catch (error) {
                console.error('[Hybrid Search] Error saving AI estimate to database:', error)
                // Still add to results even if save failed
                results.push({
                    ...aiEstimate,
                    source: 'AI_ESTIMATE' as const,
                })
            }
        }
    } catch (error) {
        console.error('[Hybrid Search] AI estimation error:', error)
    }

    return results
}

/**
 * Get single best nutrition result for a food name
 */
export async function getBestNutritionMatch(query: string): Promise<NutritionResult | null> {
    const results = await searchFoodNutrition(query)

    if (results.length === 0) {
        return null
    }

    // Prioritize: DATABASE > AI_ESTIMATE
    const dbResult = results.find(r => r.source === 'DATABASE')
    if (dbResult) return dbResult

    return results[0] // Return first AI estimate if that's all we have
}
