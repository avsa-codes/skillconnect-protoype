import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: November 29, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using InstaTask SkillConnect, you accept and agree to be bound by these Terms of
                Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
              <p className="text-muted-foreground mb-4">To use our services, you must:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Student Terms</h2>
              <p className="text-muted-foreground mb-4">As a student user, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate information about your skills and availability</li>
                <li>Complete accepted tasks professionally and on time</li>
                <li>Pay the platform fee (10% of earnings) on all completed tasks</li>
                <li>Maintain confidentiality for tasks marked as confidential</li>
                <li>Communicate professionally with organizations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Organization Terms</h2>
              <p className="text-muted-foreground mb-4">As an organization user, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate task descriptions and requirements</li>
                <li>Pay invoices within the specified due dates</li>
                <li>Pay the placement fee (15% of task value)</li>
                <li>Treat students professionally and fairly</li>
                <li>Accept the 48-hour replacement policy for no-shows</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Payments</h2>
              <p className="text-muted-foreground">
                All payments are processed through our platform. Students receive payments according to the agreed
                schedule (weekly, bi-weekly, or end-of-task). Organizations are invoiced based on task completion. Late
                payments may incur additional fees.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Replacement Policy</h2>
              <p className="text-muted-foreground">
                If a student becomes unavailable after accepting a task, InstaTask SkillConnect will provide a
                replacement within 48 hours. This guarantee is included in the placement fee at no additional cost to
                organizations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Prohibited Conduct</h2>
              <p className="text-muted-foreground mb-4">Users may not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Circumvent the platform to make direct payments</li>
                <li>Provide false or misleading information</li>
                <li>Harass or discriminate against other users</li>
                <li>Share confidential task information</li>
                <li>Use the platform for illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these terms. Users may also request
                account deletion at any time through their settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at legal@instatask.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
