import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Make More Money Doing Work You Love
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Junie is your AI career coach that turns your background + constraints into a personalized plan
            to switch careers or launch a solo business.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>✨ Personalized Paths</CardTitle>
              <CardDescription>
                AI analyzes your skills, interests, and constraints to generate 5 tailored career or business options
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 12-Week Action Plans</CardTitle>
              <CardDescription>
                Get week-by-week tasks with specific outputs, time estimates, and clear milestones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Sherpa Coach</CardTitle>
              <CardDescription>
                Chat with your persistent AI coach that remembers everything and guides you every step
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg">Share Your Sparks, Values & Dream</h3>
                <p className="text-gray-600">Quick 3-minute onboarding to understand what drives you</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg">Get 5 Personalized Options</h3>
                <p className="text-gray-600">AI-generated paths tailored to your unique situation</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg">Execute Your Plan</h3>
                <p className="text-gray-600">Follow your 12-week plan with AI guidance and generated artifacts</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Ready to Start?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Join thousands discovering their path to doing work they love
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Create Your Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
