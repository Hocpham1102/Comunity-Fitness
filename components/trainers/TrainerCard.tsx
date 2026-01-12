import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Award, BookOpen, Star } from 'lucide-react'
import Link from 'next/link'

interface TrainerCardProps {
    trainer: {
        id: string
        name: string | null
        email: string
        image: string | null
        profile: {
            bio: string | null
            specializations: string[]
            certifications: string[]
            yearsExperience: number | null
            hourlyRate: number | null
        } | null
        courseCount: number
    }
}

export function TrainerCard({ trainer }: TrainerCardProps) {
    const getInitials = () => {
        if (trainer.name) {
            return trainer.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return trainer.email.slice(0, 2).toUpperCase()
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={trainer.image || undefined} alt={trainer.name || 'Trainer'} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{trainer.name || 'Trainer'}</h3>
                        {trainer.profile?.yearsExperience && (
                            <p className="text-sm text-muted-foreground">
                                {trainer.profile.yearsExperience} years experience
                            </p>
                        )}
                    </div>
                </div>

                {trainer.profile?.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {trainer.profile.bio}
                    </p>
                )}

                {trainer.profile?.specializations && trainer.profile.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {trainer.profile.specializations.slice(0, 3).map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                            </Badge>
                        ))}
                        {trainer.profile.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{trainer.profile.specializations.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    {trainer.profile?.certifications && trainer.profile.certifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>{trainer.profile.certifications.length} certs</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{trainer.courseCount} courses</span>
                    </div>
                </div>

                <Link href={`/trainers/${trainer.id}`}>
                    <Button className="w-full">View Profile</Button>
                </Link>
            </CardContent>
        </Card>
    )
}
