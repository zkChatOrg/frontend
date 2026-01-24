import type React from "react"
import type { Metadata } from "next"
import { SITE_CONFIG, generateFAQSchema } from "@/lib/seo"

const FILE_FAQ_ITEMS = [
  {
    question: "What is Private File Drop?",
    answer:
      "Private File Drop is a one-time, end-to-end encrypted file sharing system. Files are encrypted in your browser with AES-256-GCM before upload and automatically deleted after the first download or 24 hours.",
  },
  {
    question: "Can zkChat see my files?",
    answer:
      "No. AES-256-GCM encryption happens entirely in your browser before upload. Only raw encrypted binary is sent to the server—no metadata, no filename, no file type.",
  },
  {
    question: "What file types can I send?",
    answer:
      "Any file type is supported—images, PDFs, documents, ZIP archives, videos, etc. The maximum file size is 10 MB.",
  },
]

export const metadata: Metadata = {
  title: "Private File Drop - One-Time Encrypted File Sharing",
  description:
    "Upload any file up to 10 MB with end-to-end encryption. Files self-destruct after one download or 24 hours. No accounts, no logs, zero-knowledge architecture.",
  keywords: [
    "encrypted file sharing",
    "private file drop",
    "self-destructing files",
    "secure file transfer",
    "anonymous file sharing",
    "one-time download",
  ],
  openGraph: {
    title: "Private File Drop - zkChat",
    description:
      "Upload any file up to 10 MB with end-to-end encryption. Files self-destruct after one download or 24 hours.",
    url: `${SITE_CONFIG.url}/file`,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/file`,
  },
}

export default function FileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(FILE_FAQ_ITEMS)),
        }}
      />
      {children}
    </>
  )
}
