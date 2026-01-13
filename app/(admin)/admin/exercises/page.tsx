'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    Plus,
    MoreHorizontal,
    Edit,
    Trash,
    Dumbbell,
    PlayCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface Exercise {
    id: string
    name: string
    muscleGroups: string[]
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

function AdminExercisesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [data, setData] = useState<ExercisesResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchExercises = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.set('q', searchQuery)
            params.set('pageSize', '50')

            const response = await fetch(`/api/exercises?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch exercises')

            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Error fetching exercises:', error)
            toast.error('Failed to load exercises')
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExercises()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
                    <p className="text-muted-foreground">
                        Manage your exercise library and video tutorials
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/exercises/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exercise
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>All Exercises</CardTitle>
                            <CardDescription>
                                Total {data?.total || 0} exercises in database
                            </CardDescription>
                        </div>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Muscle Groups</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Video</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Loading exercises...
                                    </TableCell>
                                </TableRow>
                            ) : data?.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No exercises found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.items.map((exercise) => (
                                    <TableRow key={exercise.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                    <Dumbbell className="w-4 h-4" />
                                                </div>
                                                {exercise.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {exercise.muscleGroups.slice(0, 2).map((muscle) => (
                                                    <Badge key={muscle} variant="secondary" className="text-xs">
                                                        {muscle.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                                {exercise.muscleGroups.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{exercise.muscleGroups.length - 2}
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
                                                <a
                                                    href={exercise.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-600 hover:underline text-sm"
                                                >
                                                    <PlayCircle className="w-4 h-4 mr-1" />
                                                    Watch
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/exercises/${exercise.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AdminExercisesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminExercisesContent />
        </Suspense>
    )
}
