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
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
            {difficulty && (
              <Badge variant="secondary" className="text-xs">{difficulty}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{exercisesCount ?? 0} exercises</span>
            {estimatedTime ? <span>{estimatedTime} min</span> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


