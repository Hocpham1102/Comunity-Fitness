import React from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Essential features for beginners',
            features: ['Basic workout tracking', 'Public community access', 'Limited meal plans'],
        },
        {
            name: 'Pro',
            price: '$9.99',
            period: '/month',
            description: 'Advanced features for serious athletes',
            features: ['Unlimited meal plans', 'Advanced analytics', 'Trainer connection', 'Priority support'],
            recommended: true,
        },
        {
            name: 'Trainer',
            price: '$29.99',
            period: '/month',
            description: 'Tools for fitness professionals',
            features: ['Client management', 'Plan creation tools', 'Billing integration', 'Custom branding'],
        },
    ]

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground text-lg">Choose the plan that fits your needs</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <Card key={plan.name} className={plan.recommended ? 'border-primary shadow-lg relative' : ''}>
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                                Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant={plan.recommended ? 'default' : 'outline'}>
                                Get Started
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
