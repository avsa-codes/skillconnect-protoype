import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. Pay only for what you use. Students earn more with our competitive rates.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* For Students */}
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader className="text-center pb-2">
                  <CardDescription className="text-primary font-medium">For Students</CardDescription>
                  <CardTitle className="text-3xl">Free to Join</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">10%</span>
                    <span className="text-muted-foreground ml-2">platform fee on earnings</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Free registration and profile</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Unlimited task applications</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Fast weekly payouts</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Verified completion certificates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Performance ratings</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Support via chat</span>
                    </li>
                  </ul>

                  <Button asChild className="w-full rounded-xl">
                    <Link href="/auth?type=student&mode=register">
                      Register as Student
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* For Organizations */}
              <Card className="rounded-2xl border-2 border-primary shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="text-center pb-2">
                  <CardDescription className="text-primary font-medium">For Organizations</CardDescription>
                  <CardTitle className="text-3xl">Pay Per Task</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">15%</span>
                    <span className="text-muted-foreground ml-2">placement fee</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Free company registration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Post unlimited tasks</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Curated shortlists by admin</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>48-hour replacement guarantee</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Invoicing & payment tracking</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Dedicated account support</span>
                    </li>
                  </ul>

                  <Button asChild className="w-full rounded-xl">
                    <Link href="/auth?type=organization&mode=register">
                      Register as Organization
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">How is the student fee calculated?</h3>
                  <p className="text-muted-foreground">
                    Students pay a 10% platform fee on their earnings. For example, if you earn ₹10,000 for a task, you
                    receive ₹9,000 and ₹1,000 goes to the platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What does the placement fee cover?</h3>
                  <p className="text-muted-foreground">
                    The 15% placement fee covers candidate sourcing, screening, matching, and our 48-hour replacement
                    guarantee if a student becomes unavailable.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">When do organizations pay?</h3>
                  <p className="text-muted-foreground">
                    Organizations receive invoices based on the task payment schedule (weekly, bi-weekly, or
                    end-of-task). Payments are due within 7 days of invoice.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
                  <p className="text-muted-foreground">
                    No. The fees listed above are the only charges. There are no signup fees, subscription fees, or
                    hidden costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
