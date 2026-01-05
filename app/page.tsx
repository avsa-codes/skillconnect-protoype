import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  Briefcase,
  GraduationCap,
  Clock,
  Shield,
  Wallet,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Hero Content */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                  Work on real projects. Get paid. Build your career.
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Join a curated network of students completing short-term, skill-based projects for trusted companies.
                  Earn income, gain experience, and build a portfolio that opens doors.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="rounded-full text-base px-8">
                    <Link href="/auth?type=student&mode=register">Register as a Student</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full text-base px-8 bg-transparent">
                    <Link href="/auth?type=organization&mode=register">Register as Organization</Link>
                  </Button>
                </div>
              </div>

              {/* Right - Why Join Card */}
              <div className="lg:pl-8">
                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-secondary/50 to-background">
                  <CardContent className="p-8">
                    <h2 className="text-xl font-bold mb-6">Why join SkillConnect ?</h2>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Student profile strength</p>
                          <p className="text-sm text-muted-foreground">92% average completion rate</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Verified companies</p>
                          <p className="text-sm text-muted-foreground">10+ trusted partners</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Average task payout</p>
                          <p className="text-sm text-muted-foreground">₹3000 - ₹12000 per project</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Portfolio-ready certificates</p>
                          <p className="text-sm text-muted-foreground">Yes, always included</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* For Students Section */}
        <section id="students" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <GraduationCap className="h-5 w-5" />
                For Students
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                Kickstart your career with real work experience
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Get matched with short-term projects that fit your skills and schedule. Build your portfolio while
                earning.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Get real work experience</h3>
                  <p className="text-muted-foreground">
                    Work on actual projects for real companies. Build skills that matter to employers.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Earn while learning</h3>
                  <p className="text-muted-foreground">
                    Get paid for your work. Transparent payments with fast weekly or bi-weekly payouts.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Fast offers via SkillConnect</h3>
                  <p className="text-muted-foreground">
                    Our admin team matches you with projects. Accept offers with a single click.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/auth?type=student&mode=register">
                  Start now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Companies Section */}
        <section id="companies" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <Building2 className="h-5 w-5" />
                For Companies
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Access skilled talent on demand</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Post tasks, get shortlisted candidates, and scale your team flexibly without long-term commitments.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Short-term skilled talent</h3>
                  <p className="text-muted-foreground">
                    Access pre-screened students with verified skills for your specific project needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Managed by InstaTask Admin</h3>
                  <p className="text-muted-foreground">
                    Our team handles screening, matching, and student management so you can focus on your work.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Replacement guarantee</h3>
                  <p className="text-muted-foreground">
                    If a student becomes unavailable, we provide a replacement within 48 hours. No questions asked.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/auth?type=organization&mode=register">
                  Post a Task
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it Works Preview */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                A simple, streamlined process to connect talent with opportunities.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Post a Task",
                  desc: "Organizations describe their project needs and requirements.",
                },
                { step: "02", title: "Admin Shortlists", desc: "Our team matches and shortlists the best candidates." },
                { step: "03", title: "Student Accepts", desc: "Selected students receive and accept offers." },
                { step: "04", title: "Work & Get Paid", desc: "Complete the work, earn money, get certificates." },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button asChild variant="outline" className="rounded-full bg-transparent">
                <Link href="/how-it-works">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="rounded-2xl bg-foreground text-background overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to get started?</h2>
                <p className="text-lg opacity-80 max-w-xl mx-auto mb-8">
                  Join InstaTask SkillConnect today and start building your future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="rounded-full">
                    <Link href="/auth?type=student&mode=register">Register as Student</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-background/20 text-background hover:bg-background/10 bg-transparent"
                  >
                    <Link href="/auth?type=organization&mode=register">Register as Organization</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
