import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Apple, TrendingUp, Users, ArrowRight, CheckCircle2, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Star className="w-3 h-3 mr-1 fill-primary" />
                Trusted by 50,000+ fitness enthusiasts
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
                Transform Your Fitness Journey
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Track workouts, plan nutrition, and achieve your goals with personalized coaching. Your complete fitness
                companion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg" asChild>
                  <Link href="/register">
                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg bg-transparent" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">10M+</div>
                  <div className="text-sm text-muted-foreground">Workouts Logged</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <div className="text-sm text-muted-foreground">Expert Trainers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/carrot-running-zoGHwRRhJZE3Uv2NdBelEffbRnxFll.jpg"
                  alt="Fitness Carrot Mascot"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to track, plan, and optimize your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Workout Tracking</h3>
                <p className="text-muted-foreground">
                  Log exercises, sets, reps, and weight. Track your progress over time with detailed analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Apple className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nutrition Planning</h3>
                <p className="text-muted-foreground">
                  Plan meals, track macros, and hit your calorie goals with our comprehensive food database.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Progress Analytics</h3>
                <p className="text-muted-foreground">
                  Visualize your journey with charts, graphs, and insights that keep you motivated.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Coaching</h3>
                <p className="text-muted-foreground">
                  Connect with certified trainers who create personalized plans just for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Fitness Enthusiasts</h2>
            <p className="text-muted-foreground">See what our community has to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Marathon Runner",
                quote: "Fitness Carrot helped me train for my first marathon. The workout tracking is incredible!",
              },
              {
                name: "Mike Chen",
                role: "Bodybuilder",
                quote: "Best nutrition tracking app I've used. Finally hit my macro goals consistently.",
              },
              {
                name: "Emma Davis",
                role: "Yoga Instructor",
                quote: "The trainer features let me manage all my clients in one place. Game changer!",
              },
            ].map((testimonial, i) => (
              <Card key={`testimonial-${testimonial.name}-${i}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={`star-${starIndex}`} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who are already transforming their lives with Fitness Carrot
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <Link href="/register">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xl">🥕</span>
                </div>
                <span className="font-bold">Fitness Carrot</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your complete fitness companion for tracking workouts, nutrition, and progress.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Fitness Carrot. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Fitness Carrot',
            description: 'Personal fitness companion for tracking workouts and nutrition',
            url: 'https://fitnesscarrot.com',
            logo: 'https://fitnesscarrot.com/logo.png',
            sameAs: [
              'https://twitter.com/fitnesscarrot',
              'https://facebook.com/fitnesscarrot',
            ],
          }),
        }}
      />
    </div>
  )
}