import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Award, BookOpen, Clock, ChevronRight, CheckCircle } from 'lucide-react'
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

const SPEC_COLORS = [
    'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    'bg-green-500/10 text-green-700 dark:text-green-400',
    'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    'bg-pink-500/10 text-pink-700 dark:text-pink-400',
]

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

    const specs = trainer.profile?.specializations ?? []
    const certs = trainer.profile?.certifications ?? []

    return (
        <Link href={`/trainers/${trainer.id}`} className="group block">
            <div className="relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">
                {/* Top gradient banner */}
                <div className="h-20 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/20 relative">
                    {/* Verified badge */}
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                        </span>
                    </div>
                </div>

                {/* Avatar - overlapping the banner */}
                <div className="px-6 flex items-end -mt-10 mb-3">
                    <Avatar className="h-20 w-20 border-4 border-card shadow-lg ring-2 ring-primary/20">
                        <AvatarImage src={trainer.image || undefined} alt={trainer.name || 'Trainer'} />
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 flex flex-col flex-1">
                    <div className="mb-3">
                        <h3 className="font-bold text-lg leading-tight mb-1">{trainer.name || 'Trainer'}</h3>
                        {trainer.profile?.yearsExperience && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{trainer.profile.yearsExperience} years experience</span>
                            </div>
                        )}
                    </div>

                    {trainer.profile?.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {trainer.profile.bio}
                        </p>
                    )}

                    {/* Specializations */}
                    {specs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {specs.slice(0, 3).map((spec, index) => (
                                <span key={index} className={`text-xs font-medium px-2.5 py-1 rounded-full ${SPEC_COLORS[index % SPEC_COLORS.length]}`}>
                                    {spec}
                                </span>
                            ))}
                            {specs.length > 3 && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                    +{specs.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-auto pt-3 border-t text-sm text-muted-foreground mb-4">
                        {certs.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-yellow-500" />
                                <span>{certs.length} cert{certs.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span>{trainer.courseCount} course{trainer.courseCount !== 1 ? 's' : ''}</span>
                        </div>
                        {trainer.profile?.hourlyRate && (
                            <div className="ml-auto font-semibold text-foreground">
                                ${trainer.profile.hourlyRate}<span className="font-normal text-muted-foreground">/hr</span>
                            </div>
                        )}
                    </div>

                    <Button className="w-full gap-2 group-hover:gap-3 transition-all">
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Link>
    )
}
