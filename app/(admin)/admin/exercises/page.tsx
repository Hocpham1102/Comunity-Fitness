'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search, Plus, MoreHorizontal, Edit, Trash, Dumbbell, PlayCircle,
    Loader2, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

interface Exercise {
    id: string
    name: string
    muscleGroups: string[]
    equipment: string[]
    difficulty: string
    videoUrl: string | null
}

interface ExercisesResponse {
    items: Exercise[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

const DIFFICULTY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

const MUSCLE_GROUP_OPTIONS = [
    'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS',
    'CORE', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'FULL_BODY',
]

const EQUIPMENT_OPTIONS = [
    'BARBELL', 'DUMBBELL', 'KETTLEBELL', 'MACHINE', 'CABLE',
    'BODYWEIGHT', 'RESISTANCE_BAND', 'PULL_UP_BAR', 'BENCH', 'OTHER',
]

export default function AdminExercisesPage() {
    const [data, setData] = useState<ExercisesResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [difficulty, setDifficulty] = useState('all')
    const [muscleGroup, setMuscleGroup] = useState('all')
    const [equipment, setEquipment] = useState('all')
    const [page, setPage] = useState(1)
    const pageSize = 20

    const debouncedSearch = useDebounce(searchQuery, 400)

    const fetchExercises = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
            })
            if (debouncedSearch) params.set('q', debouncedSearch)
            if (difficulty !== 'all') params.set('difficulty', difficulty)
            if (muscleGroup !== 'all') params.append('muscleGroups', muscleGroup)
            if (equipment !== 'all') params.append('equipment', equipment)

            const response = await fetch(`/api/exercises?${params}`)
            if (!response.ok) throw new Error('Failed to fetch exercises')
            setData(await response.json())
        } catch {
            toast.error('Failed to load exercises')
        } finally {
            setIsLoading(false)
        }
    }, [page, debouncedSearch, difficulty, muscleGroup, equipment])

    useEffect(() => { fetchExercises() }, [fetchExercises])
    useEffect(() => { setPage(1) }, [debouncedSearch, difficulty, muscleGroup, equipment])

    const handleDelete = async (exerciseId: string, exerciseName: string) => {
        if (!confirm(`Delete "${exerciseName}"? This cannot be undone.`)) return
        try {
            const res = await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            toast.success(`"${exerciseName}" deleted`)
            fetchExercises()
        } catch {
            toast.error('Failed to delete exercise')
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setDifficulty('all')
        setMuscleGroup('all')
        setEquipment('all')
    }

    const hasActiveFilters = searchQuery || difficulty !== 'all' || muscleGroup !== 'all' || equipment !== 'all'
    const totalPages = data?.totalPages ?? 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
                    <p className="text-muted-foreground">Manage your exercise library and video tutorials</p>
                </div>
                <Button asChild>
                    <Link href="/admin/exercises/new">
                        <Plus className="w-4 h-4 mr-2" />Add Exercise
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>All Exercises</CardTitle>
                            <CardDescription>Total {data?.total ?? 0} exercises</CardDescription>
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
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
                        <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Muscle Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Muscle Groups</SelectItem>
                                {MUSCLE_GROUP_OPTIONS.map(m => (
                                    <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={equipment} onValueChange={setEquipment}>
                            <SelectTrigger className="w-[170px]">
                                <SelectValue placeholder="Equipment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Equipment</SelectItem>
                                {EQUIPMENT_OPTIONS.map(e => (
                                    <SelectItem key={e} value={e}>{e.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Muscle Groups</TableHead>
                                <TableHead>Equipment</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Video</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : data?.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p>No exercises found</p>
                                    </TableCell>
                                </TableRow>
                            ) : data?.items.map((exercise) => (
                                <TableRow key={exercise.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Dumbbell className="w-4 h-4" />
                                            </div>
                                            {exercise.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {exercise.muscleGroups.slice(0, 2).map((m) => (
                                                <Badge key={m} variant="secondary" className="text-xs">
                                                    {m.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                            {exercise.muscleGroups.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{exercise.muscleGroups.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {exercise.equipment?.slice(0, 1).map((e) => (
                                                <Badge key={e} variant="outline" className="text-xs">
                                                    {e.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                            {(exercise.equipment?.length ?? 0) > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{exercise.equipment.length - 1}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            exercise.difficulty === 'BEGINNER' ? 'secondary' :
                                                exercise.difficulty === 'INTERMEDIATE' ? 'default' :
                                                    'destructive'
                                        } className="text-xs">
                                            {exercise.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {exercise.videoUrl ? (
                                            <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center text-blue-600 hover:underline text-sm">
                                                <PlayCircle className="w-4 h-4 mr-1" />Watch
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/exercises/${exercise.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600"
                                                    onClick={() => handleDelete(exercise.id, exercise.name)}>
                                                    <Trash className="mr-2 h-4 w-4" />Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data?.total ?? 0)} of {data?.total ?? 0}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                                    <ChevronLeft className="h-4 w-4" />Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>
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
