'use client'

import { useRouter } from 'next/navigation'
import { MealLogger } from '@/components/features/nutrition/MealLogger'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Utensils } from 'lucide-react'
import Link from 'next/link'

export default function LogMealPage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push('/nutrition')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/nutrition">
                        <Button variant="ghost" size="sm" className="mb-4 hover:bg-muted">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Nutrition
                        </Button>
                    </Link>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Log Your Meal</h1>
                            <p className="text-muted-foreground mt-1">
                                Track what you eat to reach your nutrition goals
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <MealLogger onSuccess={handleSuccess} />
            </div>
        </div>
    )
}
