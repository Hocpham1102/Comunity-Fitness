import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Clock, Dumbbell, UserPlus } from 'lucide-react'

interface TrainerWorkoutCardProps {
    readonly id: string
    readonly name: string
    readonly description?: string | null
    readonly difficulty?: string | null
    readonly estimatedTime?: number | null
    readonly exercisesCount?: number | null
    readonly onDelete?: (id: string) => void
    readonly onAssign?: (id: string) => void
}

export default function TrainerWorkoutCard({
    id,
    name,
    description,
    difficulty,
    estimatedTime,
    exercisesCount,
    onDelete,
    onAssign
}: TrainerWorkoutCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-1">{name}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    {difficulty && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                            {difficulty}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>{exercisesCount ?? 0} exercises</span>
                    </div>
                    {estimatedTime && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{estimatedTime} min</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/trainer/workouts/${id}/edit`}>
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onAssign?.(id)}
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Assign
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
            </CardContent>
        </Card>
    )
}
