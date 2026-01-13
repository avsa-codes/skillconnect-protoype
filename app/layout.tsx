import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InstaTask SkillConnect — Work on real projects. Get paid.",
  description:
    "Work on real projects, get paid, and build your career with InstaTask SkillConnect. A curated marketplace connecting students with companies.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "InstaTask SkillConnect",
    description: "Work on real projects. Get paid. Build your career.",
    url: "https://instatask.in",
    siteName: "InstaTask SkillConnect",
    images: [
      {
        url: "https://instatask.in/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
}


export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>

        {/* Vercel Analytics */}
        <Analytics />

        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-K8BYFZNB9B" />
      </body>
    </html>
  )
}
