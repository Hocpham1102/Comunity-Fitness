import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Mail, Calendar, Activity } from 'lucide-react'
import { ClientStatus } from '@prisma/client'

interface ClientCardProps {
    client: {
        id: string
        name: string | null
        email: string
        status: ClientStatus
        startDate: Date
        lastActivity?: Date
    }
    isSelected?: boolean
    onSelectChange?: (selected: boolean) => void
}

const statusColors = {
    ACTIVE: 'bg-green-500',
    INVITED: 'bg-yellow-500',
    INACTIVE: 'bg-gray-500',
    CANCELLED: 'bg-red-500',
}

const statusLabels = {
    ACTIVE: 'Active',
    INVITED: 'Invited',
    INACTIVE: 'Inactive',
    CANCELLED: 'Cancelled',
}

export function ClientCard({ client, isSelected, onSelectChange }: ClientCardProps) {
    return (
        <Card className={isSelected ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    {onSelectChange && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={onSelectChange}
                            className="mt-1"
                        />
                    )}
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{client.name || 'Unnamed Client'}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                            </div>
                        </div>
                    </div>
                    <Badge className={statusColors[client.status]}>
                        {statusLabels[client.status]}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {new Date(client.startDate).toLocaleDateString()}</span>
                    </div>
                    {client.lastActivity && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="w-4 h-4" />
                            <span>Last active: {new Date(client.lastActivity).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button asChild variant="default" size="sm" className="flex-1">
                    <Link href={`/trainer/clients/${client.id}`}>View Details</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/trainer/workouts/assign?clientId=${client.id}`}>Assign Workout</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
