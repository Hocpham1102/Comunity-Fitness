'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { toast } from 'sonner'
import TrainerExerciseCard from '@/components/features/exercises/TrainerExerciseCard'
import ExerciseFormDialog from '@/components/features/exercises/ExerciseFormDialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Exercise {
    id: string
    name: string
    description?: string | null
    instructions?: string | null
    muscleGroups: string[]
    equipment: string[]
    difficulty: string
    videoUrl?: string | null
    defaultReps?: number | null
    defaultWeight?: number | null
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
    rejectionReason?: string | null
    createdAt: string
}

export default function TrainerExercisesPage() {
    const router = useRouter()
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

    useEffect(() => {
        fetchExercises()
    }, [statusFilter])

    const fetchExercises = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/trainer/exercises?status=${statusFilter}`)
            if (!response.ok) throw new Error('Failed to fetch exercises')

            const result = await response.json()
            setExercises(result.data || [])
        } catch (error: any) {
            toast.error(error.message || 'Failed to load exercises')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = async (id: string) => {
        try {
            const response = await fetch(`/api/trainer/exercises/${id}`)
            if (!response.ok) throw new Error('Failed to fetch exercise')

            const exercise = await response.json()
            setEditingExercise(exercise)
            setIsEditDialogOpen(true)
        } catch (error: any) {
            toast.error(error.message || 'Failed to load exercise')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exercise?')) return

        try {
            const response = await fetch(`/api/trainer/exercises/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Failed to delete exercise')

            toast.success('Exercise deleted successfully')
            fetchExercises()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete exercise')
        }
    }

    const filteredExercises = exercises

    const stats = {
        total: exercises.length,
        pending: exercises.filter(e => e.approvalStatus === 'PENDING').length,
        approved: exercises.filter(e => e.approvalStatus === 'APPROVED').length,
        rejected: exercises.filter(e => e.approvalStatus === 'REJECTED').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Exercises</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your custom exercises
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exercise
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">Approved</p>
                    <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">Rejected</p>
                    <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Exercise Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading exercises...</p>
                </div>
            ) : filteredExercises.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">
                        {statusFilter === 'all'
                            ? "You haven't created any exercises yet"
                            : `No ${statusFilter} exercises found`
                        }
                    </p>
                    {statusFilter === 'all' && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Exercise
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExercises.map((exercise) => (
                        <TrainerExerciseCard
                            key={exercise.id}
                            id={exercise.id}
                            name={exercise.name}
                            description={exercise.description}
                            muscleGroups={exercise.muscleGroups}
                            difficulty={exercise.difficulty}
                            approvalStatus={exercise.approvalStatus}
                            rejectionReason={exercise.rejectionReason}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <ExerciseFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchExercises}
                mode="create"
            />

            {/* Edit Dialog */}
            {editingExercise && (
                <ExerciseFormDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onSuccess={fetchExercises}
                    mode="edit"
                    exerciseId={editingExercise.id}
                    initialData={{
                        name: editingExercise.name,
                        description: editingExercise.description || '',
                        instructions: editingExercise.instructions || '',
                        muscleGroups: editingExercise.muscleGroups,
                        equipment: editingExercise.equipment,
                        difficulty: editingExercise.difficulty,
                        videoUrl: editingExercise.videoUrl || '',
                        defaultReps: editingExercise.defaultReps || undefined,
                        defaultWeight: editingExercise.defaultWeight || undefined,
                    }}
                />
            )}
        </div>
    )
}
