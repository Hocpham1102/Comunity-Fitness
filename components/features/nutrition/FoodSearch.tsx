'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/client/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Food {
    id: string
    name: string
    description?: string
    calories: number
    protein: number
    carbs: number
    fats: number
    servingSize?: number
    servingUnit?: string
}

interface FoodSearchProps {
    onSelectFood: (food: Food) => void
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Food[]>([])
    const [loading, setLoading] = useState(false)
    const debouncedQuery = useDebounce(query, 300)

    // Search foods when debounced query changes
    useEffect(() => {
        const searchFoods = async () => {
            if (!debouncedQuery.trim()) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const response = await fetch(`/api/foods/search?q=${encodeURIComponent(debouncedQuery)}`)
                if (response.ok) {
                    const data = await response.json()
                    setResults(data.items || [])
                }
            } catch (error) {
                console.error('Error searching foods:', error)
            } finally {
                setLoading(false)
            }
        }

        searchFoods()
    }, [debouncedQuery])

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search foods..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {results.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.map((food) => (
                        <Card
                            key={food.id}
                            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => {
                                onSelectFood(food)
                                setQuery('')
                                setResults([])
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium">{food.name}</h4>
                                    {food.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{food.description}</p>
                                    )}
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-semibold">{food.calories.toFixed(0)} kcal</p>
                                    <p className="text-xs text-muted-foreground">
                                        per {food.servingSize || 100}{food.servingUnit || 'g'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <span>P: {food.protein.toFixed(1)}g</span>
                                <span>C: {food.carbs.toFixed(1)}g</span>
                                <span>F: {food.fats.toFixed(1)}g</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {query && !loading && results.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    No foods found
                </p>
            )}
        </div>
    )
}
