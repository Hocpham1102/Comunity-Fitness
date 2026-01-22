'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, Sparkles, Database } from 'lucide-react'
import { toast } from 'sonner'

interface NutritionResult {
    id?: string
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
    isNew?: boolean
}

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

interface QuickMealInputProps {
    onSelectFood: (food: Food) => void
}

const SOURCE_ICONS = {
    DATABASE: Database,
    AI_ESTIMATE: Sparkles,
}

const SOURCE_LABELS = {
    DATABASE: 'Database',
    AI_ESTIMATE: 'AI Estimate',
}

const CONFIDENCE_COLORS = {
    high: 'bg-green-500/10 text-green-700 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    low: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
}

export function QuickMealInput({ onSelectFood }: QuickMealInputProps) {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<NutritionResult[]>([])

    const handleSearch = async () => {
        if (!query.trim()) {
            toast.error('Vui lòng nhập tên món ăn')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(
                `/api/foods/search-by-name?q=${encodeURIComponent(query)}`
            )

            if (!response.ok) {
                throw new Error('Failed to search')
            }

            const data = await response.json()
            setResults(data.items || [])

            if (data.items.length === 0) {
                toast.info('Không tìm thấy món ăn này. Hãy thử tên khác.')
            }
        } catch (error) {
            console.error('Error searching food:', error)
            toast.error('Không thể tìm kiếm món ăn')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleSelectResult = (result: NutritionResult) => {
        // Convert NutritionResult to Food format
        const food: Food = {
            id: result.id || `temp-${Date.now()}`,
            name: result.name,
            description: result.description,
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fats: result.fats,
            servingSize: result.servingSize,
            servingUnit: result.servingUnit,
        }

        onSelectFood(food)
        setQuery('')
        setResults([])
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Nhập tên món ăn (vd: phở bò, bánh mì, cơm gà...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 h-12 text-base"
                        disabled={loading}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    size="lg"
                    className="h-12 px-6"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tìm...
                        </>
                    ) : (
                        'Tìm kiếm'
                    )}
                </Button>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-muted-foreground">
                💡 Nhập tên món ăn bằng tiếng Việt hoặc tiếng Anh. Hệ thống sẽ tự động tính toán dinh dưỡng.
            </p>

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">
                            Tìm thấy {results.length} kết quả
                        </h4>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {results.map((result, index) => {
                            const SourceIcon = SOURCE_ICONS[result.source]
                            const confidenceColor = result.confidence
                                ? CONFIDENCE_COLORS[result.confidence]
                                : ''

                            return (
                                <Card
                                    key={index}
                                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-2"
                                    onClick={() => handleSelectResult(result)}
                                >
                                    <div className="space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">{result.name}</h4>
                                                    {result.isNew && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Mới
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.description}
                                                </p>
                                            </div>

                                            {/* Source Badge */}
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className="gap-1">
                                                    <SourceIcon className="w-3 h-3" />
                                                    {SOURCE_LABELS[result.source]}
                                                </Badge>
                                                {result.confidence && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${confidenceColor}`}
                                                    >
                                                        {result.confidence}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nutrition Info */}
                                        <div className="flex gap-3 text-sm">
                                            <Badge variant="secondary" className="font-semibold">
                                                {result.calories.toFixed(0)} kcal
                                            </Badge>
                                            <Badge variant="outline">P: {result.protein.toFixed(1)}g</Badge>
                                            <Badge variant="outline">C: {result.carbs.toFixed(1)}g</Badge>
                                            <Badge variant="outline">F: {result.fats.toFixed(1)}g</Badge>
                                        </div>

                                        {/* Serving Info */}
                                        <p className="text-xs text-muted-foreground">
                                            Trên {result.servingSize || 100}
                                            {result.servingUnit || 'g'}
                                        </p>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
