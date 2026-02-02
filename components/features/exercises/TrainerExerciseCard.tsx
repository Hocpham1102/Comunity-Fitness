'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Dumbbell, AlertCircle } from 'lucide-react'

interface TrainerExerciseCardProps {
    id: string
    name: string
    description?: string | null
    muscleGroups: string[]
    difficulty: string
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
    rejectionReason?: string | null
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

const statusConfig = {
    PENDING: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    APPROVED: {
        label: 'Approved',
        className: 'bg-green-100 text-green-800 border-green-300',
    },
    REJECTED: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800 border-red-300',
    },
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
    BEGINNER: { label: 'Beginner', className: 'bg-blue-100 text-blue-800' },
    INTERMEDIATE: { label: 'Intermediate', className: 'bg-purple-100 text-purple-800' },
    ADVANCED: { label: 'Advanced', className: 'bg-orange-100 text-orange-800' },
    EXPERT: { label: 'Expert', className: 'bg-red-100 text-red-800' },
}

export default function TrainerExerciseCard({
    id,
    name,
    description,
    muscleGroups,
    difficulty,
    approvalStatus,
    rejectionReason,
    onEdit,
    onDelete,
}: TrainerExerciseCardProps) {
    const status = statusConfig[approvalStatus]
    const difficultyInfo = difficultyConfig[difficulty] || difficultyConfig.BEGINNER

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
                {/* Header with name and status */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{name}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <Badge variant="outline" className={status.className}>
                        {status.label}
                    </Badge>
                </div>

                {/* Muscle groups and difficulty */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={difficultyInfo.className}>
                        <Dumbbell className="w-3 h-3 mr-1" />
                        {difficultyInfo.label}
                    </Badge>
                    {muscleGroups.slice(0, 3).map((muscle) => (
                        <Badge key={muscle} variant="outline" className="text-xs">
                            {muscle.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                    {muscleGroups.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{muscleGroups.length - 3} more
                        </Badge>
                    )}
                </div>

                {/* Rejection reason if rejected */}
                {approvalStatus === 'REJECTED' && rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-xs text-red-700 mt-0.5">{rejectionReason}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEdit?.(id)}
                        disabled={approvalStatus === 'APPROVED'}
                    >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => onDelete?.(id)}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete
                    </Button>
                </div>

                {approvalStatus === 'APPROVED' && (
                    <p className="text-xs text-muted-foreground text-center">
                        Approved exercises cannot be edited
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
