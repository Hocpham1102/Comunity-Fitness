'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Clock, Users, DollarSign, Award, BookOpen,
    ChevronDown, ChevronRight, Loader2, ArrowLeft,
    User, Globe, Dumbbell, Utensils, CheckCircle, ShoppingCart, Zap
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { CheckoutDialog } from '@/components/features/cart/CheckoutDialog'

const categoryLabels: Record<string, string> = {
    STRENGTH_TRAINING: 'Strength Training', CARDIO: 'Cardio', YOGA: 'Yoga',
    PILATES: 'Pilates', HIIT: 'HIIT', BODYBUILDING: 'Bodybuilding',
    WEIGHT_LOSS: 'Weight Loss', FLEXIBILITY: 'Flexibility',
    SPORTS_SPECIFIC: 'Sports Specific', GENERAL_FITNESS: 'General Fitness',
}

const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-green-500/10 text-green-700 dark:text-green-400',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    ADVANCED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    EXPERT: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

interface Session {
    id: string
    dayNumber: number
    title: string | null
    notes: string | null
    workoutId: string | null
    mealPlanId: string | null
}

interface Week {
    id: string
    weekNumber: number
    title: string | null
    description: string | null
    sessions: Session[]
}

interface Course {
    id: string
    title: string
    description: string
    shortDescription: string | null
    category: string
    difficulty: string
    price: number
    currency: string
    duration: number | null
    thumbnailUrl: string | null
    previewVideoUrl: string | null
    enrollmentCount: number
    isEnrolled: boolean
    trainer: {
        id: string
        name: string | null
        image: string | null
        trainerProfile: {
            bio: string | null
            specializations: string[]
            yearsExperience: number | null
            websiteUrl: string | null
        } | null
    }
    weeks: Week[]
}

export default function CourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'trainer'>('overview')
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())

    const { addItem, hasItem, removeItem } = useCartStore()

    const fetchCourse = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/courses/${courseId}`)
            if (res.ok) {
                const data = await res.json()
                setCourse(data)
                // Auto-expand first week
                if (data.weeks?.length > 0) {
                    setExpandedWeeks(new Set([data.weeks[0].id]))
                }
            } else if (res.status === 404) {
                router.push('/courses')
            }
        } catch (error) {
            console.error('Error fetching course:', error)
        } finally {
            setLoading(false)
        }
    }, [courseId, router])

    useEffect(() => {
        if (courseId) fetchCourse()
    }, [courseId, fetchCourse])

    const handleEnroll = async () => {
        setEnrolling(true)
        try {
            const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
            if (res.status === 401) {
                toast.error('Please login to enroll')
                router.push('/auth/login')
                return
            }
            if (res.ok) {
                const data = await res.json()
                if (data.alreadyEnrolled) {
                    toast.info('You are already enrolled!')
                } else {
                    toast.success('Enrolled successfully! 🎉')
                    removeItem(courseId)
                }
                setCourse(prev => prev ? { ...prev, isEnrolled: true } : prev)
                router.push(`/courses/${courseId}/learn`)
            } else {
                toast.error('Failed to enroll. Please try again.')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setEnrolling(false)
        }
    }

    const toggleWeek = (weekId: string) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev)
            if (next.has(weekId)) next.delete(weekId)
            else next.add(weekId)
            return next
        })
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )

    if (!course) return null

    const totalSessions = course.weeks.reduce((sum, w) => sum + w.sessions.length, 0)

    return (
        <div className="max-w-6xl mx-auto">
            {/* Back */}
            <Link href="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{categoryLabels[course.category] ?? course.category}</Badge>
                            <Badge className={difficultyColors[course.difficulty]}>{course.difficulty}</Badge>
                        </div>
                        <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
                        {course.shortDescription && (
                            <p className="text-lg text-muted-foreground">{course.shortDescription}</p>
                        )}

                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-5 mt-4 text-sm text-muted-foreground">
                            {course.duration && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />{course.duration} weeks
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />{totalSessions} sessions
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />{course.enrollmentCount} enrolled
                            </span>
                            <Link href={`/trainers/${course.trainer.id}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <User className="w-4 h-4" />by {course.trainer.name ?? 'Trainer'}
                            </Link>
                        </div>
                    </div>

                    {/* Preview Media */}
                    {(course.previewVideoUrl || course.thumbnailUrl) && (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                            {course.previewVideoUrl ? (
                                <video src={course.previewVideoUrl} controls className="w-full h-full object-cover"
                                    poster={course.thumbnailUrl ?? undefined} />
                            ) : course.thumbnailUrl ? (
                                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                            ) : null}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b">
                        <div className="flex gap-1">
                            {(['overview', 'curriculum', 'trainer'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{course.description}</p>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-4">
                                {course.weeks.length} weeks · {totalSessions} sessions total
                                {!course.isEnrolled && ' · Enroll to access full content'}
                            </p>
                            {course.weeks.map(week => (
                                <div key={week.id} className="border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleWeek(week.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                                    >
                                        <div>
                                            <span className="font-semibold">Week {week.weekNumber}</span>
                                            {week.title && <span className="text-muted-foreground ml-2">— {week.title}</span>}
                                            <span className="ml-2 text-xs text-muted-foreground">({week.sessions.length} sessions)</span>
                                        </div>
                                        {expandedWeeks.has(week.id)
                                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                    </button>
                                    {expandedWeeks.has(week.id) && (
                                        <div className="border-t divide-y">
                                            {week.sessions.map(session => (
                                                <div key={session.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs flex-shrink-0">
                                                        {session.dayNumber}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-medium">{session.title ?? `Day ${session.dayNumber}`}</span>
                                                        <div className="flex gap-2 mt-0.5">
                                                            {session.workoutId && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Dumbbell className="w-3 h-3" />Workout
                                                                </span>
                                                            )}
                                                            {session.mealPlanId && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Utensils className="w-3 h-3" />Meal Plan
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {course.isEnrolled
                                                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        : <span className="text-xs text-muted-foreground">🔒 Enroll to access</span>
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'trainer' && (
                        <div className="flex gap-5">
                            <div className="w-20 h-20 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                                {course.trainer.image ? (
                                    <Image src={course.trainer.image} alt={course.trainer.name ?? ''} width={80} height={80} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                                        {course.trainer.name?.[0] ?? 'T'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">{course.trainer.name ?? 'Trainer'}</h3>
                                {course.trainer.trainerProfile?.yearsExperience && (
                                    <p className="text-muted-foreground text-sm mb-3">
                                        {course.trainer.trainerProfile.yearsExperience} years experience
                                    </p>
                                )}
                                {course.trainer.trainerProfile?.bio && (
                                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{course.trainer.trainerProfile.bio}</p>
                                )}
                                {(course.trainer.trainerProfile?.specializations?.length ?? 0) > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {course.trainer.trainerProfile!.specializations.map((s, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <Link href={`/trainers/${course.trainer.id}`}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <User className="w-4 h-4" />View Profile
                                        </Button>
                                    </Link>
                                    {course.trainer.trainerProfile?.websiteUrl && (
                                        <a href={course.trainer.trainerProfile.websiteUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Globe className="w-4 h-4" />Website
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Enroll Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 shadow-xl border-2">
                        <CardContent className="p-6 space-y-5">
                            {/* Thumbnail */}
                            {course.thumbnailUrl && (
                                <div className="relative h-40 rounded-lg overflow-hidden bg-muted">
                                    <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                                </div>
                            )}

                            {/* Price */}
                            <div className="text-center">
                                {course.price === 0 ? (
                                    <span className="text-3xl font-bold text-green-600">Free</span>
                                ) : (
                                    <div className="flex items-center justify-center gap-1">
                                        <DollarSign className="w-6 h-6" />
                                        <span className="text-3xl font-bold">{course.price}</span>
                                        <span className="text-muted-foreground">{course.currency}</span>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            {course.isEnrolled ? (
                                <Link href={`/courses/${course.id}/learn`} className="block">
                                    <Button className="w-full gap-2" size="lg">
                                        <BookOpen className="w-5 h-5" />Continue Learning
                                    </Button>
                                </Link>
                            ) : (
                                <div className="space-y-3">
                                    {course.price === 0 ? (
                                        <Button
                                            className="w-full gap-2" size="lg"
                                            onClick={handleEnroll} disabled={enrolling}
                                        >
                                            {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />}
                                            {enrolling ? 'Enrolling...' : 'Enroll Now (Free)'}
                                        </Button>
                                    ) : (
                                        <>
                                            {hasItem(course.id) ? (
                                                <Button
                                                    variant="secondary"
                                                    className="w-full gap-2"
                                                    size="lg"
                                                    onClick={() => removeItem(course.id)}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Added to Cart
                                                </Button>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full gap-2 px-2"
                                                        size="lg"
                                                        onClick={() => {
                                                            addItem({
                                                                id: course.id,
                                                                title: course.title,
                                                                price: course.price,
                                                                currency: course.currency,
                                                                thumbnailUrl: course.thumbnailUrl,
                                                                trainerName: course.trainer?.name
                                                            })
                                                            toast.success('Added to cart')
                                                        }}
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                        Add to Cart
                                                    </Button>

                                                    <CheckoutDialog itemsToCheckout={[{
                                                        id: course.id,
                                                        title: course.title,
                                                        price: course.price,
                                                        currency: course.currency,
                                                        thumbnailUrl: course.thumbnailUrl || undefined,
                                                        trainerName: course.trainer?.name || undefined
                                                    }]}>
                                                        <Button
                                                            className="w-full gap-2 px-2"
                                                            size="lg"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Zap className="w-4 h-4" />
                                                            Buy Now
                                                        </Button>
                                                    </CheckoutDialog>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Course Meta */}
                            <div className="space-y-2 pt-2 border-t text-sm">
                                {course.duration && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />{course.duration} weeks
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BookOpen className="w-4 h-4" />{totalSessions} sessions
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />{course.enrollmentCount} students enrolled
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
