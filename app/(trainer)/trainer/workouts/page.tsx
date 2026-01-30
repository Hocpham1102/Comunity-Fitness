'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function TrainerWorkoutsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Workout Templates</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage your workout templates
                    </p>
                </div>
                <Button asChild>
                    <Link href="/trainer/workouts/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Link>
                </Button>
            </div>

            {/* Empty State */}
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No workout templates yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first workout template to assign to clients
                        </p>
                        <Button asChild>
                            <Link href="/trainer/workouts/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Template
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
