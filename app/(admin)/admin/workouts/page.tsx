'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Dumbbell, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import AdminDeleteWorkoutButton from '@/components/admin/AdminDeleteWorkoutButton'
import TogglePublicButton from '@/components/admin/TogglePublicButton'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

interface Workout {
    id: string
    name: string
    difficulty: string
    estimatedTime: number | null
    isPublic: boolean
    _count: { exercises: number }
}

interface WorkoutsResponse {
    items: Workout[]
    total: number
    page: number
    pageSize: number
}

const DIFFICULTY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

export default function AdminWorkoutsPage() {
    const [data, setData] = useState<WorkoutsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState('all')
    const [status, setStatus] = useState('all') // all | public | private
    const [page, setPage] = useState(1)
    const pageSize = 20

    const debouncedSearch = useDebounce(search, 400)

    const fetchWorkouts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                isTemplate: 'true',
                page: page.toString(),
                pageSize: pageSize.toString(),
            })
            if (debouncedSearch) params.set('q', debouncedSearch)
            if (difficulty !== 'all') params.set('difficulty', difficulty)
            if (status === 'public') params.set('isPublic', 'true')
            if (status === 'private') params.set('isPublic', 'false')

            const res = await fetch(`/api/workouts?${params}`)
            if (!res.ok) throw new Error('Failed to fetch workouts')
            setData(await res.json())
        } catch {
            toast.error('Failed to load workouts')
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch, difficulty, status])

    useEffect(() => { fetchWorkouts() }, [fetchWorkouts])
    useEffect(() => { setPage(1) }, [debouncedSearch, difficulty, status])

    const clearFilters = () => {
        setSearch('')
        setDifficulty('all')
        setStatus('all')
    }

    const hasActiveFilters = search || difficulty !== 'all' || status !== 'all'
    const totalPages = data ? Math.ceil(data.total / pageSize) : 0

    const difficultyColor = (d: string) => {
        switch (d) {
            case 'BEGINNER': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'ADVANCED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
            case 'EXPERT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workout Templates</h1>
                    <p className="text-muted-foreground">Manage workout templates for users</p>
                </div>
                <Button asChild>
                    <Link href="/admin/workouts/new">
                        <Plus className="w-4 h-4 mr-2" />Create Template
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>All Templates</CardTitle>
                            <CardDescription>Total: {data?.total ?? 0} workout templates</CardDescription>
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
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                {DIFFICULTY_OPTIONS.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                    <th className="p-3 text-left text-sm font-medium">Difficulty</th>
                                    <th className="p-3 text-left text-sm font-medium">Duration</th>
                                    <th className="p-3 text-left text-sm font-medium">Exercises</th>
                                    <th className="p-3 text-left text-sm font-medium">Status</th>
                                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </td></tr>
                                ) : data?.items.length === 0 ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">
                                        <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p>No workouts found</p>
                                    </td></tr>
                                ) : data?.items.map((workout) => (
                                    <tr key={workout.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 text-sm font-medium">{workout.name}</td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor(workout.difficulty)}`}>
                                                {workout.difficulty}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {workout.estimatedTime || 0} min
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {workout._count?.exercises || 0}
                                        </td>
                                        <td className="p-3 text-sm">
                                            <Badge variant={workout.isPublic ? 'default' : 'secondary'}>
                                                {workout.isPublic ? 'Public' : 'Private'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/workouts/${workout.id}/edit`}>Edit</Link>
                                                </Button>
                                                <TogglePublicButton
                                                    workoutId={workout.id}
                                                    workoutName={workout.name}
                                                    isPublic={workout.isPublic}
                                                    onSuccess={fetchWorkouts}
                                                />
                                                <AdminDeleteWorkoutButton
                                                    workoutId={workout.id}
                                                    workoutName={workout.name}
                                                    onSuccess={fetchWorkouts}
                                                />
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
