'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function TrainerAnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground mt-2">
                    Track your performance and client engagement
                </p>
            </div>

            {/* Coming Soon */}
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                        <p className="text-muted-foreground">
                            Detailed analytics and reporting features will be available here
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
