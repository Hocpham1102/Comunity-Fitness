import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, Users, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface CourseCardProps {
    course: {
        id: string
        title: string
        shortDescription: string | null
        category: string
        duration: number | null
        difficulty: string
        price: number
        currency: string
        thumbnailUrl: string | null
        enrollmentCount: number
    }
}

const categoryLabels: Record<string, string> = {
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

const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-green-500/10 text-green-700 dark:text-green-400',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    ADVANCED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    EXPERT: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {course.thumbnailUrl && (
                <div className="relative h-48 w-full bg-muted">
                    <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                        {categoryLabels[course.category] || course.category}
                    </Badge>
                    <Badge className={`text-xs ${difficultyColors[course.difficulty] || ''}`}>
                        {course.difficulty}
                    </Badge>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>

                {course.shortDescription && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.shortDescription}
                    </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {course.duration && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration} weeks</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrollmentCount} enrolled</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-bold">
                        <DollarSign className="w-5 h-5" />
                        <span>{course.price}</span>
                        <span className="text-sm text-muted-foreground">{course.currency}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Enroll Now
                </Button>
            </CardFooter>
        </Card>
    )
}
