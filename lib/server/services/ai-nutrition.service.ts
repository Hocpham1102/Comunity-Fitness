/**
 * AI-Powered Nutrition Estimation Service
 * Uses Google Generative AI to estimate nutritional values for foods
 * Especially useful for Vietnamese foods not in USDA database
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

interface NutritionEstimate {
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber?: number
    sugar?: number
    servingSize: number
    servingUnit: string
    source: 'AI_ESTIMATE'
    confidence: 'high' | 'medium' | 'low'
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

/**
 * Estimate nutrition values for a food using AI
 */
export async function estimateNutrition(foodName: string): Promise<NutritionEstimate | null> {
    try {
        // Use gemini-1.5-flash - available in free tier
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `You are a nutrition expert. Estimate the nutritional values for "${foodName}" per 100g.

Please provide your estimate in the following JSON format (respond ONLY with valid JSON, no other text):

{
  "name": "standardized food name in English",
  "description": "brief description of the food",
  "calories": number (kcal per 100g),
  "protein": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fats": number (grams per 100g),
  "fiber": number (grams per 100g, optional),
  "sugar": number (grams per 100g, optional),
  "confidence": "high" | "medium" | "low"
}

Important:
- For Vietnamese foods (phở, bánh mì, cơm, etc.), use typical Vietnamese recipes
- For common foods, use standard nutritional databases as reference
- Be realistic and conservative in estimates
- Set confidence to "high" for common foods, "medium" for regional dishes, "low" for unusual items
- All values should be per 100g
- Return ONLY the JSON object, no markdown, no explanation`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.error('AI response did not contain valid JSON:', text)
            return null
        }

        const estimate = JSON.parse(jsonMatch[0])

        // Validate the response
        if (!estimate.calories || !estimate.protein || !estimate.carbs || !estimate.fats) {
            console.error('AI response missing required nutrition fields:', estimate)
            return null
        }

        return {
            name: estimate.name || foodName,
            description: estimate.description || 'AI-estimated nutritional values',
            calories: Number(estimate.calories),
            protein: Number(estimate.protein),
            carbs: Number(estimate.carbs),
            fats: Number(estimate.fats),
            fiber: estimate.fiber ? Number(estimate.fiber) : undefined,
            sugar: estimate.sugar ? Number(estimate.sugar) : undefined,
            servingSize: 100,
            servingUnit: 'g',
            source: 'AI_ESTIMATE',
            confidence: estimate.confidence || 'medium',
        }
    } catch (error) {
        console.error('Error estimating nutrition with AI:', error)
        return null
    }
}

/**
 * Batch estimate nutrition for multiple foods
 */
export async function batchEstimateNutrition(foodNames: string[]): Promise<NutritionEstimate[]> {
    const estimates = await Promise.allSettled(
        foodNames.map(name => estimateNutrition(name))
    )

    return estimates
        .filter((result): result is PromiseFulfilledResult<NutritionEstimate> =>
            result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
}
