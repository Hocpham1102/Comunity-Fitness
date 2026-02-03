import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WorkoutTemplateCardProps {
  readonly id: string
  readonly name: string
  readonly difficulty?: string | null
  readonly estimatedTime?: number | null
  readonly exercisesCount?: number | null
}

export default function WorkoutTemplateCard({ id, name, difficulty, estimatedTime, exercisesCount }: WorkoutTemplateCardProps) {
  return (
    <Link href={`/workouts/${id}/start`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 cursor-pointer group">
        <CardContent className="p-5 flex flex-col h-full justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              {difficulty && (
                <Badge variant={difficulty === 'BEGINNER' ? 'secondary' : 'outline'} className="text-[10px] shrink-0 uppercase tracking-wider">
                  {difficulty}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <span>⚡ {exercisesCount ?? 0} exercises</span>
            </div>
            {estimatedTime ? (
              <div className="flex items-center gap-1">
                <span>⏱️ {estimatedTime} min</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


