import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
    return (
        <div className="container py-12">
            <h1 className="text-4xl font-bold mb-8 text-center">About Fitness Carrot</h1>
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Fitness Carrot is dedicated to helping you achieve your fitness goals through
                            personalized meal plans, workout tracking, and expert guidance.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Who We Are</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            We are a community-driven platform connecting trainers and clients for
                            a seamless fitness journey.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
