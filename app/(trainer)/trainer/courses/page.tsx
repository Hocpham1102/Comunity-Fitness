'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Plus, Search, BookOpen, Users, TrendingUp, Eye,
    Loader2, Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { VerificationGate } from '@/components/trainer/VerificationGate'
import CourseCard from '@/components/features/courses/CourseCard'
import CourseFormDialog from '@/components/features/courses/CourseFormDialog'
import CreateCourseWizard from '@/components/features/courses/CreateCourseWizard'
import { useDebounce } from '@/hooks/use-debounce'

interface Course {
    id: string
    title: string
    description: string
    shortDescription?: string | null
    category: string
    difficulty: string
    price: number
    currency: string
    duration?: number | null
    thumbnailUrl?: string | null
    previewVideoUrl?: string | null
    isPublished: boolean
    enrollmentCount: number
    weekCount: number
    sessionCount: number
    createdAt: string
}

const CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'STRENGTH_TRAINING', label: 'Strength Training' },
    { value: 'CARDIO', label: 'Cardio' },
    { value: 'YOGA', label: 'Yoga' },
    { value: 'PILATES', label: 'Pilates' },
    { value: 'HIIT', label: 'HIIT' },
    { value: 'BODYBUILDING', label: 'Bodybuilding' },
    { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
    { value: 'FLEXIBILITY', label: 'Flexibility' },
    { value: 'SPORTS_SPECIFIC', label: 'Sports Specific' },
    { value: 'GENERAL_FITNESS', label: 'General Fitness' },
]

export default function TrainerCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')
    const [publishFilter, setPublishFilter] = useState('all')
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)

    const debouncedSearch = useDebounce(search, 400)

    const fetchCourses = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (debouncedSearch) params.set('q', debouncedSearch)
            if (category !== 'all') params.set('category', category)
            if (publishFilter === 'published') params.set('isPublished', 'true')
            if (publishFilter === 'draft') params.set('isPublished', 'false')

            const res = await fetch(`/api/trainer/courses?${params}`)
            if (!res.ok) throw new Error('Failed to load courses')
            const data = await res.json()
            setCourses((data.courses ?? []).map((c: any) => ({
                ...c,
                weekCount: c.weeks?.length ?? 0,
                sessionCount: c.weeks?.reduce((sum: number, w: any) => sum + (w._count?.sessions ?? w.sessions?.length ?? 0), 0) ?? 0,
            })))
        } catch {
            toast.error('Failed to load courses')
        } finally {
            setIsLoading(false)
        }
    }, [debouncedSearch, category, publishFilter])

    useEffect(() => { fetchCourses() }, [fetchCourses])

    const handleEdit = async (id: string) => {
        const course = courses.find(c => c.id === id)
        if (!course) return
        setEditingCourse(course)
        setEditOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/trainer/courses/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            toast.success('Course deleted')
            fetchCourses()
        } catch {
            toast.error('Failed to delete course')
        }
    }

    const handleTogglePublish = async (id: string, current: boolean) => {
        try {
            const res = await fetch(`/api/trainer/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !current }),
            })
            if (!res.ok) throw new Error()
            toast.success(current ? 'Course unpublished' : 'Course published!')
            fetchCourses()
        } catch {
            toast.error('Failed to update course')
        }
    }

    const stats = {
        total: courses.length,
        published: courses.filter(c => c.isPublished).length,
        draft: courses.filter(c => !c.isPublished).length,
        students: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
    }

    return (
        <VerificationGate softBlock>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Courses</h1>
                        <p className="text-muted-foreground mt-1">Create and manage your online courses</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Course
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary/60" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/40 rounded-lg p-4 flex items-center gap-3">
                        <Eye className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-green-800 dark:text-green-400">Published</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.published}</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/10 border rounded-lg p-4 flex items-center gap-3">
                        <Filter className="w-8 h-8 text-gray-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Drafts</p>
                            <p className="text-2xl font-bold">{stats.draft}</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40 rounded-lg p-4 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-800 dark:text-blue-400">Students</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.students}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={publishFilter} onValueChange={setPublishFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-1">
                            {search || category !== 'all' || publishFilter !== 'all'
                                ? 'No courses match your filters'
                                : 'No courses yet'}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            {search || category !== 'all' || publishFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first course to share your expertise with students'}
                        </p>
                        {!(search || category !== 'all' || publishFilter !== 'all') && (
                            <Button onClick={() => setCreateOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Course
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                {...course}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onTogglePublish={handleTogglePublish}
                            />
                        ))}
                    </div>
                )}

                {/* Create Wizard */}
                <CreateCourseWizard
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    onSuccess={fetchCourses}
                />

                {/* Edit Dialog */}
                {editingCourse && (
                    <CourseFormDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        onSuccess={fetchCourses}
                        mode="edit"
                        courseId={editingCourse.id}
                        initialData={{
                            title: editingCourse.title,
                            description: editingCourse.description,
                            shortDescription: editingCourse.shortDescription ?? '',
                            category: editingCourse.category,
                            difficulty: editingCourse.difficulty,
                            price: String(editingCourse.price),
                            duration: editingCourse.duration ? String(editingCourse.duration) : '',
                            thumbnailUrl: editingCourse.thumbnailUrl ?? '',
                            previewVideoUrl: editingCourse.previewVideoUrl ?? '',
                            isPublished: editingCourse.isPublished,
                        }}

                    />
                )}
            </div>
        </VerificationGate>
    )
}
