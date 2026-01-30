'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Apple } from 'lucide-react'
import Link from 'next/link'

export default function TrainerNutritionPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Meal Plan Templates</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage your meal plan templates
                    </p>
                </div>
                <Button asChild>
                    <Link href="/trainer/nutrition/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Meal Plan
                    </Link>
                </Button>
            </div>

            {/* Empty State */}
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No meal plans yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first meal plan template to assign to clients
                        </p>
                        <Button asChild>
                            <Link href="/trainer/nutrition/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Meal Plan
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
