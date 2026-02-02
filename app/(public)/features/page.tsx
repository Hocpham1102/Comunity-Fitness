import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Utensils, Users, LineChart } from 'lucide-react'

export default function FeaturesPage() {
    const features = [
        {
            title: 'Workout Tracking',
            description: 'Log your exercises, sets, and reps with ease.',
            icon: Dumbbell,
        },
        {
            title: 'Meal Planning',
            description: 'Get personalized meal plans tailored to your goals.',
            icon: Utensils,
        },
        {
            title: 'Community',
            description: 'Connect with friends and stay motivated.',
            icon: Users,
        },
        {
            title: 'Progress Analytics',
            description: 'Visualize your improvements over time.',
            icon: LineChart,
        },
    ]

    return (
        <div className="container py-12">
            <h1 className="text-4xl font-bold mb-12 text-center">Features</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                    <Card key={feature.title}>
                        <CardHeader>
                            <feature.icon className="w-10 h-10 text-primary mb-4" />
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
