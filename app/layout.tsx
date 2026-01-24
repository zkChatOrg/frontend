import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { InstallBanner } from "@/components/install-banner"
import { IOSAppBanner } from "@/components/ios-app-banner"
import { NavHeader } from "@/components/nav-header"
import { StatusProvider } from "@/lib/status-context"
import { SITE_CONFIG, generateOrganizationSchema, generateWebsiteSchema, generateSoftwareAppSchema } from "@/lib/seo"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap", // Add font-display swap for better performance
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "encrypted chat",
    "private messaging",
    "zero knowledge",
    "end-to-end encryption",
    "ephemeral chat",
    "one-time message",
    "secure file sharing",
    "AES-256 encryption",
    "anonymous chat",
    "no logs",
    "privacy tools",
    "self-destructing messages",
  ],
  authors: [{ name: "zkChat", url: SITE_CONFIG.url }],
  creator: "zkChat",
  publisher: "zkChat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "zkChat - Military-Grade Privacy For Everyday",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  category: "technology",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Allow user scaling for accessibility
  viewportFit: "cover",
  themeColor: SITE_CONFIG.themeColor,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        {/* Smart App Banner - shows "Open" if app installed, "Get" if not */}
        <meta name="apple-itunes-app" content="app-id=XXXXXXXXXX, app-argument=https://zkchat.org" />
        <link rel="author" type="text/plain" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM Full Context" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSoftwareAppSchema()),
          }}
        />
      </head>
      <body className={`${geist.className} antialiased`}>
        <StatusProvider>
          <IOSAppBanner />
          <NavHeader />
          {children}
          <InstallBanner />
        </StatusProvider>
        <Analytics />
      </body>
    </html>
  )
}
