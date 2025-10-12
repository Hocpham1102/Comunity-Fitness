import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Apple, BarChart3, Users, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Personal
              <span className="text-orange-600"> Fitness Companion</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track workouts, plan meals, monitor progress, and connect with trainers. 
              All in one comprehensive fitness platform designed to help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features to support your fitness journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Dumbbell className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Workout Tracking</CardTitle>
                <CardDescription>
                  Log workouts, track exercises, and monitor your fitness progress with detailed analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Apple className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Nutrition Planning</CardTitle>
                <CardDescription>
                  Plan meals, track macros, and maintain a balanced diet with our comprehensive nutrition tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Progress Analytics</CardTitle>
                <CardDescription>
                  Visualize your progress with detailed charts and insights to stay motivated.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Trainer Connection</CardTitle>
                <CardDescription>
                  Connect with certified trainers for personalized guidance and support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is protected with enterprise-grade security and privacy controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Real-time Sync</CardTitle>
                <CardDescription>
                  Access your data anywhere with seamless synchronization across all devices.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already achieving their fitness goals with Fitness Carrot.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Start Your Journey Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}