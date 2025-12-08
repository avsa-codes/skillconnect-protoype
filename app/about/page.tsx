import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Heart, Zap, Users, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Bridging the gap between talent and opportunity
              </h1>
              <p className="text-lg text-muted-foreground">
                InstaTask SkillConnect was created to solve a simple problem: students need real work experience, and
                companies need skilled, flexible talent. We bring them together.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground">
                    To democratize access to quality work experience for students across India while providing companies
                    with a reliable, managed talent solution for short-term projects.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-muted-foreground">
                    A world where every student can build a meaningful career portfolio before graduation, and every
                    company can find the right talent without long-term hiring commitments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What drives us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our values guide everything we do at InstaTask SkillConnect.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="rounded-2xl border-0">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Speed & Efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    Fast matching, quick offers, and timely payments. We value everyone's time.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Community First</h3>
                  <p className="text-sm text-muted-foreground">
                    Building a network of trusted students and companies who grow together.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Fair & Transparent</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear pricing, honest communication, and fair treatment for everyone.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">500+</p>
                <p className="text-muted-foreground mt-2">Students Placed</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">84</p>
                <p className="text-muted-foreground mt-2">Partner Companies</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">92%</p>
                <p className="text-muted-foreground mt-2">Completion Rate</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">4.8</p>
                <p className="text-muted-foreground mt-2">Avg Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join our community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Whether you're a student looking for experience or a company seeking talent, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/auth?mode=register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
