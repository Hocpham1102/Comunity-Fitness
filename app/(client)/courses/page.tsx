'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Search, Loader2, Clock, Users, DollarSign, ShoppingCart, Check, Zap, Package, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckoutDialog } from '@/components/features/cart/CheckoutDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface OrderItem {
    id: string
    price: number
    currency: string
    course: {
        title: string
        thumbnailUrl: string | null
        trainer: {
            name: string | null
        }
    }
}

interface Order {
    id: string
    totalAmount: number
    currency: string
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
    createdAt: string
    items: OrderItem[]
}

const CATEGORIES = [
    { value: '', label: 'All Categories' },
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

const DIFFICULTIES = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
]

const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-green-500/10 text-green-700 dark:text-green-400',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    ADVANCED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    EXPERT: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

interface Course {
    id: string
    title: string
    shortDescription: string | null
    category: string
    difficulty: string
    price: number
    currency: string
    duration: number | null
    thumbnailUrl: string | null
    enrollmentCount: number
    isEnrolled?: boolean
    trainer: { id: string; name: string | null; image: string | null }
}

import { Suspense } from 'react'

function CoursesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    const { addItem, hasItem, removeItem } = useCartStore()

    useEffect(() => {
        fetchCourses()
    }, [page, category, difficulty])

    useEffect(() => {
        const fetchOrders = async () => {
            setLoadingOrders(true)
            try {
                const res = await fetch('/api/user/orders')
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data.orders || [])
                }
            } catch (error) {
                console.error('Failed to fetch orders', error)
            } finally {
                setLoadingOrders(false)
            }
        }

        fetchOrders()
    }, [])

    const fetchCourses = async (searchOverride?: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(category && { category }),
                ...(difficulty && { difficulty }),
                ...((searchOverride ?? search) && { search: searchOverride ?? search }),
            })
            const res = await fetch(`/api/courses?${params}`)
            if (res.ok) {
                const data = await res.json()
                setCourses(data.courses)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchCourses(search)
    }

    const handleFilterChange = (type: 'category' | 'difficulty', value: string) => {
        setPage(1)
        if (type === 'category') setCategory(value)
        else setDifficulty(value)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
            case 'PENDING':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            case 'CANCELLED':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Fitness Courses</h1>
                <p className="text-muted-foreground">
                    Browse expert-led courses from verified trainers and start your fitness journey
                </p>
            </div>

            <Tabs defaultValue={searchParams.get('tab') === 'history' ? 'history' : 'courses'} className="space-y-8">
                <TabsList className="mb-4">
                    <TabsTrigger value="courses">All Courses</TabsTrigger>
                    <TabsTrigger value="history">Purchase History</TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-8 mt-0 border-none p-0 outline-none">

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <select
                                value={difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {DIFFICULTIES.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Courses Grid */}
                    {!loading && courses.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => router.push(`/courses/${course.id}`)}
                                        className="group cursor-pointer"
                                    >
                                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">
                                            {/* Thumbnail */}
                                            <div className="relative h-48 bg-muted flex-shrink-0">
                                                {course.thumbnailUrl ? (
                                                    <Image
                                                        src={course.thumbnailUrl}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                        <span className="text-4xl">🏋️</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur">
                                                        {CATEGORIES.find(c => c.value === course.category)?.label ?? course.category}
                                                    </Badge>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <Badge className={`text-xs ${difficultyColors[course.difficulty] ?? ''} bg-background/90 backdrop-blur`}>
                                                        {course.difficulty}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardContent className="p-5 flex flex-col flex-1">
                                                {/* Trainer */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-7 h-7 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
                                                        {course.trainer.image ? (
                                                            <Image src={course.trainer.image} alt={course.trainer.name ?? ''} width={28} height={28} className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                                                                {course.trainer.name?.[0] ?? 'T'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground truncate">{course.trainer.name ?? 'Trainer'}</span>
                                                </div>

                                                <h3 className="font-semibold text-base mb-2 line-clamp-2 flex-1">{course.title}</h3>

                                                {course.shortDescription && (
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.shortDescription}</p>
                                                )}

                                                {/* Stats */}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                                    {course.duration && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {course.duration} weeks
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {course.enrollmentCount} enrolled
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-between mt-auto">
                                                    {course.isEnrolled ? (
                                                        <Button
                                                            className="w-full gap-2"
                                                            variant="default"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/courses/${course.id}/learn`);
                                                            }}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Continue Learning
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-1 font-bold text-lg">
                                                                {course.price === 0 ? (
                                                                    <span className="text-green-600">Free</span>
                                                                ) : (
                                                                    <>
                                                                        <DollarSign className="w-4 h-4" />
                                                                        <span>{course.price}</span>
                                                                        <span className="text-sm text-muted-foreground font-normal">{course.currency}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {hasItem(course.id) ? (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            removeItem(course.id)
                                                                        }}
                                                                    >
                                                                        <Check className="w-4 h-4 mr-1" />
                                                                        Added
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            addItem({
                                                                                id: course.id,
                                                                                title: course.title,
                                                                                price: course.price,
                                                                                currency: course.currency,
                                                                                thumbnailUrl: course.thumbnailUrl,
                                                                                trainerName: course.trainer?.name
                                                                            })
                                                                        }}
                                                                    >
                                                                        <ShoppingCart className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                <CheckoutDialog itemsToCheckout={[{
                                                                    id: course.id,
                                                                    title: course.title,
                                                                    price: course.price,
                                                                    currency: course.currency,
                                                                    thumbnailUrl: course.thumbnailUrl || undefined,
                                                                    trainerName: course.trainer?.name || undefined
                                                                }]}>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors px-2"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                        }}
                                                                    >
                                                                        <Zap className="w-4 h-4 mr-1" />
                                                                        Buy Now
                                                                    </Button>
                                                                </CheckoutDialog>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                                    <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Empty State */}
                    {!loading && courses.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🏋️</div>
                            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-8 mt-0 border-none p-0 outline-none">
                    {loadingOrders ? (
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-muted rounded w-1/4"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-muted rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 border rounded-xl bg-muted/20 border-dashed">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                            <p className="text-muted-foreground mb-6">You haven't purchased any courses yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id} className="overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b pb-4">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <CardTitle className="text-base font-mono">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">Total Amount</div>
                                                <div className="text-xl font-bold">{order.totalAmount} {order.currency}</div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ul className="divide-y">
                                            {order.items.map((item) => (
                                                <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                                                    <div className="relative w-full sm:w-32 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                                        {item.course.thumbnailUrl ? (
                                                            <Image
                                                                src={item.course.thumbnailUrl}
                                                                alt={item.course.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="font-medium line-clamp-1">{item.course.title}</h4>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                By {item.course.trainer.name || 'Unknown Trainer'}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm font-medium mt-2">
                                                            {item.price === 0 ? 'Free' : `${item.price} ${item.currency}`}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function CoursesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <CoursesContent />
        </Suspense>
    )
}
