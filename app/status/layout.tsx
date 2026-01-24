import type React from "react"
import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Service Status - System Health & Metrics",
  description:
    "Check the real-time status and health of zkChat backend services. View usage metrics and run deep diagnostics.",
  openGraph: {
    title: "Service Status - zkChat",
    description: "Check the real-time status and health of zkChat backend services.",
    url: `${SITE_CONFIG.url}/status`,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/status`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children
}
