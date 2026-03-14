'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Loader2, TrendingUp } from 'lucide-react'

const categoryLabels: Record<string, string> = {
    STRENGTH_TRAINING: 'Strength Training', CARDIO: 'Cardio', YOGA: 'Yoga',
    PILATES: 'Pilates', HIIT: 'HIIT', BODYBUILDING: 'Bodybuilding',
    WEIGHT_LOSS: 'Weight Loss', FLEXIBILITY: 'Flexibility',
    SPORTS_SPECIFIC: 'Sports Specific', GENERAL_FITNESS: 'General Fitness',
}

interface Enrollment {
    id: string
    enrolledAt: string
    completedAt: string | null
    progress: number
    course: {
        id: string
        title: string
        shortDescription: string | null
        category: string
        difficulty: string
        thumbnailUrl: string | null
        duration: number | null
        weekCount: number
        trainer: { id: string; name: string | null; image: string | null }
    }
}

export default function MyCoursesPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const res = await fetch('/api/user/enrollments')
                if (res.ok) {
                    const data = await res.json()
                    setEnrollments(data.enrollments)
                }
            } catch (error) {
                console.error('Error fetching enrollments:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchEnrollments()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                <p className="text-muted-foreground">Track your enrolled courses and continue learning</p>
            </div>

            {enrollments.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-6">Browse trainer courses and start learning today</p>
                    <Link href="/courses">
                        <Button className="gap-2">
                            <BookOpen className="w-4 h-4" />Browse Courses
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrollments.map((enrollment) => {
                        const course = enrollment.course
                        return (
                            <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-40 bg-muted">
                                    {course.thumbnailUrl ? (
                                        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                            <span className="text-4xl">🏋️</span>
                                        </div>
                                    )}
                                    {enrollment.completedAt && (
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-green-500 text-white">Completed</Badge>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-5">
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {categoryLabels[course.category] ?? course.category}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-base mb-1 line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-1">by {course.trainer.name ?? 'Trainer'}</p>

                                    {/* Progress */}
                                    <div className="my-3">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(enrollment.progress)}%</span>
                                        </div>
                                        <Progress value={enrollment.progress} className="h-2" />
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                        {course.duration && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />{course.duration} weeks
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5" />{course.weekCount} modules
                                        </span>
                                    </div>

                                    <Link href={`/courses/${course.id}/learn`} className="block">
                                        <Button className="w-full gap-2" variant={enrollment.completedAt ? 'outline' : 'default'}>
                                            <TrendingUp className="w-4 h-4" />
                                            {enrollment.completedAt ? 'Review Course' : 'Continue Learning'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
