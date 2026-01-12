'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CourseCard } from '@/components/trainers/CourseCard'
import { Award, Mail, Globe, Loader2 } from 'lucide-react'

interface TrainerProfile {
    id: string
    name: string | null
    email: string
    image: string | null
    trainerProfile: {
        bio: string | null
        specializations: string[]
        certifications: string[]
        yearsExperience: number | null
        hourlyRate: number | null
        websiteUrl: string | null
    } | null
}

interface Course {
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

export default function TrainerProfilePage() {
    const params = useParams()
    const trainerId = params.trainerId as string

    const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (trainerId) {
            fetchTrainerData()
        }
    }, [trainerId])

    const fetchTrainerData = async () => {
        setLoading(true)
        try {
            // Fetch trainer profile
            const trainerRes = await fetch(`/api/profile?userId=${trainerId}`)
            if (trainerRes.ok) {
                const trainerData = await trainerRes.json()
                setTrainer(trainerData)
            }

            // Fetch trainer courses
            const coursesRes = await fetch(`/api/trainers/${trainerId}/courses`)
            if (coursesRes.ok) {
                const coursesData = await coursesRes.json()
                setCourses(coursesData.courses)
            }
        } catch (error) {
            console.error('Error fetching trainer data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = () => {
        if (trainer?.name) {
            return trainer.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return trainer?.email.slice(0, 2).toUpperCase() || 'T'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!trainer) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">Trainer not found</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Trainer Profile Header */}
            <Card className="mb-8">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={trainer.image || undefined} alt={trainer.name || 'Trainer'} />
                            <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{trainer.name || 'Trainer'}</h1>

                            {trainer.trainerProfile?.yearsExperience && (
                                <p className="text-muted-foreground mb-4">
                                    {trainer.trainerProfile.yearsExperience} years of experience
                                </p>
                            )}

                            {trainer.trainerProfile?.bio && (
                                <p className="text-muted-foreground mb-4">{trainer.trainerProfile.bio}</p>
                            )}

                            {/* Specializations */}
                            {trainer.trainerProfile?.specializations && trainer.trainerProfile.specializations.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.trainerProfile.specializations.map((spec, index) => (
                                            <Badge key={index} variant="secondary">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certifications */}
                            {trainer.trainerProfile?.certifications && trainer.trainerProfile.certifications.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Certifications
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.trainerProfile.certifications.map((cert, index) => (
                                            <Badge key={index} variant="outline">
                                                {cert}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{trainer.email}</span>
                                </div>
                                {trainer.trainerProfile?.websiteUrl && (
                                    <a
                                        href={trainer.trainerProfile.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-primary"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>Website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Section */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Courses & Programs</h2>

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-12">
                        No courses available yet
                    </p>
                )}
            </div>
        </div>
    )
}
