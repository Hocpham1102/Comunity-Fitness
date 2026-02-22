'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, UtensilsCrossed, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

interface Food {
    id: string
    name: string
    calories: number
    protein: number
    carbs: number
    fats: number
    isPublic: boolean
}

interface FoodsResponse {
    items: Food[]
    total: number
    page: number
    pageSize: number
}

export default function AdminFoodsPage() {
    const [data, setData] = useState<FoodsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all') // all | public | private
    const [page, setPage] = useState(1)
    const pageSize = 20

    const debouncedSearch = useDebounce(search, 400)

    const fetchFoods = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
            })
            if (debouncedSearch) params.set('q', debouncedSearch)
            if (status === 'public') params.set('isPublic', 'true')
            if (status === 'private') params.set('isPublic', 'false')

            const res = await fetch(`/api/foods?${params}`)
            if (!res.ok) throw new Error('Failed to fetch foods')
            setData(await res.json())
        } catch {
            toast.error('Failed to load foods')
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch, status])

    useEffect(() => { fetchFoods() }, [fetchFoods])
    useEffect(() => { setPage(1) }, [debouncedSearch, status])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
        try {
            const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            toast.success(`"${name}" deleted`)
            fetchFoods()
        } catch {
            toast.error('Failed to delete food')
        }
    }

    const clearFilters = () => {
        setSearch('')
        setStatus('all')
    }

    const hasActiveFilters = search || status !== 'all'
    const totalPages = data ? Math.ceil(data.total / pageSize) : 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Food Database</h1>
                    <p className="text-muted-foreground">Manage food items and nutritional information</p>
                </div>
                <Button asChild>
                    <Link href="/admin/foods/new">
                        <Plus className="w-4 h-4 mr-2" />Add Food
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>All Foods</CardTitle>
                            <CardDescription>Total: {data?.total ?? 0} food items</CardDescription>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                <X className="w-4 h-4 mr-1" />Clear filters
                            </Button>
                        )}
                    </div>
                    {/* Filter row */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left text-sm font-medium">Name</th>
                                    <th className="p-3 text-left text-sm font-medium">Calories</th>
                                    <th className="p-3 text-left text-sm font-medium">Protein</th>
                                    <th className="p-3 text-left text-sm font-medium">Carbs</th>
                                    <th className="p-3 text-left text-sm font-medium">Fats</th>
                                    <th className="p-3 text-left text-sm font-medium">Status</th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="p-10 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </td></tr>
                                ) : data?.items.length === 0 ? (
                                    <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">
                                        <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p>No food items found</p>
                                    </td></tr>
                                ) : data?.items.map((food) => (
                                    <tr key={food.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 text-sm font-medium">{food.name}</td>
                                        <td className="p-3 text-sm text-muted-foreground">{food.calories.toFixed(0)} kcal</td>
                                        <td className="p-3 text-sm text-muted-foreground">{food.protein.toFixed(1)}g</td>
                                        <td className="p-3 text-sm text-muted-foreground">{food.carbs.toFixed(1)}g</td>
                                        <td className="p-3 text-sm text-muted-foreground">{food.fats.toFixed(1)}g</td>
                                        <td className="p-3 text-sm">
                                            <Badge variant={food.isPublic ? 'default' : 'secondary'}>
                                                {food.isPublic ? 'Public' : 'Private'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/foods/${food.id}/edit`}>Edit</Link>
                                                </Button>
                                                <Button variant="destructive" size="sm"
                                                    onClick={() => handleDelete(food.id, food.name)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data?.total ?? 0)} of {data?.total ?? 0}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                                    <ChevronLeft className="h-4 w-4" />Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
                                    Next<ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
