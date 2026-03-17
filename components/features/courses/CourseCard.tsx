'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    BookOpen, Users, Clock, DollarSign, Pencil, Trash2,
    Eye, EyeOff, Layers, Wrench,
} from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
    STRENGTH_TRAINING: 'Strength Training',
    CARDIO: 'Cardio',
    YOGA: 'Yoga',
    PILATES: 'Pilates',
    HIIT: 'HIIT',
    BODYBUILDING: 'Bodybuilding',
    WEIGHT_LOSS: 'Weight Loss',
    FLEXIBILITY: 'Flexibility',
    SPORTS_SPECIFIC: 'Sports Specific',
    GENERAL_FITNESS: 'General Fitness',
}

const DIFFICULTY_COLOR: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ADVANCED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

interface CourseCardProps {
    id: string
    title: string
    shortDescription?: string | null
    category: string
    difficulty: string
    price: number
    currency: string
    duration?: number | null
    isPublished: boolean
    enrollmentCount: number
    weekCount: number
    sessionCount: number
    thumbnailUrl?: string | null
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onTogglePublish: (id: string, currentValue: boolean) => void
}

export default function CourseCard({
    id, title, shortDescription, category, difficulty, price, currency,
    duration, isPublished, enrollmentCount, weekCount, sessionCount, thumbnailUrl,
    onEdit, onDelete, onTogglePublish,
}: CourseCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false)

    return (
        <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            <div className="relative h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <BookOpen className="w-10 h-10 text-primary/40" />
                )}
                <div className="absolute top-2 right-2">
                    <Badge className={isPublished
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0'
                        : 'bg-gray-100 text-gray-600 border-0'
                    }>
                        {isPublished ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {isPublished ? 'Published' : 'Draft'}
                    </Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 bg-background/80 backdrop-blur-sm">
                        <Layers className="w-2.5 h-2.5" />
                        {weekCount}w · {sessionCount} sessions
                    </Badge>
                </div>
            </div>

            <CardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-semibold leading-tight line-clamp-2">{title}</h3>

                {shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{shortDescription}</p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[category] ?? category}</Badge>
                    <Badge className={`text-xs border-0 ${DIFFICULTY_COLOR[difficulty] ?? ''}`}>
                        {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                    </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {price === 0 ? 'Free' : `${currency} ${price.toFixed(2)}`}
                    </span>
                    {duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {duration}h
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                {/* Build Program — primary action */}
                <Link href={`/trainer/courses/${id}/builder`} className="w-full" prefetch={false}>
                    <Button size="sm" className="w-full gap-2" variant="default">
                        <Wrench className="w-3.5 h-3.5" />
                        Build Program
                    </Button>
                </Link>

                {/* Secondary actions */}
                <div className="grid grid-cols-4 gap-2 w-full">
                    <Link href={`/trainer/courses/${id}/students`} prefetch={false}>
                        <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs px-2">
                            <Users className="w-3 h-3" />
                            Students
                        </Button>
                    </Link>

                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => onEdit(id)}
                    >
                        <Pencil className="w-3 h-3" />
                        Edit Info
                    </Button>

                    <Button
                        size="sm"
                        variant={isPublished ? 'secondary' : 'outline'}
                        className="gap-1.5 text-xs"
                        onClick={() => onTogglePublish(id, isPublished)}
                    >
                        {isPublished
                            ? <><EyeOff className="w-3 h-3" />Unpublish</>
                            : <><Eye className="w-3 h-3" />Publish</>}
                    </Button>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete <strong>"{title}"</strong> and all its
                                    weeks, sessions, and enrollment data. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => onDelete(id)}
                                >
                                    Delete Course
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardFooter>
        </Card>
    )
}
