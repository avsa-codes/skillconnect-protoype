import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, FileText, Users, Send, CheckCircle, Wallet, Clock, Shield, RefreshCw } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">How InstaTask SkillConnect Works</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, managed process that connects organizations with talented students for short-term projects.
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    01
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Organization Posts a Task</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Organizations describe their project requirements including skills needed, duration, weekly hours,
                    and compensation. Tasks can be remote or on-site.
                  </p>
                  <Card className="rounded-2xl bg-muted/30 border-0">
                    <CardContent className="p-6">
                      <p className="font-medium mb-2">Task details include:</p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Task title & description
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Required skills
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Duration & hours
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Compensation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Location preference
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Number of positions
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    02
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Admin Reviews & Shortlists</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Our admin team reviews the task and matches it with the best candidates from our student pool based
                    on skills, availability, ratings, and past performance.
                  </p>
                  <Card className="rounded-2xl bg-muted/30 border-0">
                    <CardContent className="p-6">
                      <p className="font-medium mb-2">Matching criteria:</p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Skill match score
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Student availability
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Past performance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Location preference
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    03
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Send className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Offers Sent to Students</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Shortlisted students receive offer notifications with task details. They can review the brief,
                    compensation, and timeline before accepting or declining.
                  </p>
                  <Card className="rounded-2xl bg-muted/30 border-0">
                    <CardContent className="p-6">
                      <p className="font-medium mb-2">Students receive:</p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Full task brief
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Company information
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Compensation details
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Start date & duration
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    04
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Work, Get Paid & Certified</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Once accepted, students complete the work. Payments are processed on the agreed schedule, and upon
                    completion, students receive verified certificates.
                  </p>
                  <Card className="rounded-2xl bg-muted/30 border-0">
                    <CardContent className="p-6">
                      <p className="font-medium mb-2">What you get:</p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Timely payments
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Completion certificate
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Performance rating
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Portfolio reference
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Guarantees</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We ensure quality and reliability for both organizations and students.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="rounded-2xl border-0">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">48-Hour Replacement</h3>
                  <p className="text-sm text-muted-foreground">
                    If a student becomes unavailable, we provide a replacement within 48 hours.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Verified Profiles</h3>
                  <p className="text-sm text-muted-foreground">
                    All students and organizations go through our verification process.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Fast Payouts</h3>
                  <p className="text-sm text-muted-foreground">
                    Students receive payments on time with transparent fee structure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join InstaTask SkillConnect today and start connecting with opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/auth?type=student&mode=register">
                  Register as Student
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent">
                <Link href="/auth?type=organization&mode=register">
                  Register as Organization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
