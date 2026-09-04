import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Band */}
      <section className="w-full relative overflow-hidden bg-canvas py-section">
        {/* Abstract Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[800px] h-[600px] bg-gradient-to-tr from-gradient-develop-start via-gradient-preview-start to-gradient-ship-end blur-3xl opacity-40 rounded-full mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Badge variant="category-pill" className="mb-6 border border-hairline">
            Introducing Padhaanewala 2.0
          </Badge>
          <h1 className="font-geist-sans text-display-xl font-semibold tracking-tight text-ink max-w-4xl mb-6 leading-tight">
            The platform for your entire educational journey.
          </h1>
          <p className="text-body-lg text-body max-w-2xl mb-10">
            Find the perfect college, master in-demand courses, and ace your exams with AI-powered mock tests. Engineered for students who demand the best.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="primary" size="lg">
              Start Learning
            </Button>
            <Button variant="secondary" size="lg">
              Explore Colleges
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full bg-canvas border-t border-hairline py-3xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-geist-sans text-heading-lg font-semibold tracking-tight text-ink">
              Everything you need to succeed.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-canvas-elevated border border-hairline flex items-center justify-center mb-4">
                  <span className="text-xl">🎓</span>
                </div>
                <CardTitle className="text-heading-md">College Discovery</CardTitle>
                <CardDescription>
                  Filter through thousands of colleges by ranking, placement rate, and location to find your perfect fit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/colleges" className="text-[14px] text-link hover:text-link-deep font-medium">
                  Search Colleges →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-canvas-elevated border border-hairline flex items-center justify-center mb-4">
                  <span className="text-xl">📚</span>
                </div>
                <CardTitle className="text-heading-md">Premium Courses</CardTitle>
                <CardDescription>
                  Learn from industry experts with structured curricula designed to get you hired.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/courses" className="text-[14px] text-link hover:text-link-deep font-medium">
                  Browse Courses →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-canvas-elevated border border-hairline flex items-center justify-center mb-4">
                  <span className="text-xl">✍️</span>
                </div>
                <CardTitle className="text-heading-md">AI Mock Tests</CardTitle>
                <CardDescription>
                  Practice with adaptive mock tests that analyze your weaknesses and guide your preparation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/mock-tests" className="text-[14px] text-link hover:text-link-deep font-medium">
                  Take a Test →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="w-full bg-canvas border-t border-hairline py-4xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h2 className="font-geist-sans text-display-xl font-semibold tracking-tight text-ink mb-8">
            Ready to start learning?
          </h2>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="email" placeholder="Enter your email" />
            <Button variant="primary">Sign Up</Button>
          </div>
          <p className="text-body-sm text-mute mt-4">
            Join 10,000+ students already on Padhaanewala.
          </p>
        </div>
      </section>
    </div>
  )
}
