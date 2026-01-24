import type React from "react"
import type { Metadata } from "next"
import { SITE_CONFIG, generateFAQSchema } from "@/lib/seo"

const OTM_FAQ_ITEMS = [
  {
    question: "What is a one-time message?",
    answer:
      "A one-time message is a single-use, end-to-end encrypted secret sent as a link. The message is encrypted client-side in your browser using AES-256-GCM before being uploaded to the server. Once the recipient opens the link, the server immediately deletes it.",
  },
  {
    question: "Can zkChat read my one-time messages?",
    answer:
      "No, it's mathematically impossible. Encryption happens in your browser using AES-256-GCM before the message leaves your device. The decryption key is embedded in the URL fragment which browsers never transmit to servers.",
  },
  {
    question: "How long is a one-time message valid?",
    answer:
      "A one-time message remains valid until the first successful read OR until it automatically expires after 7 days, whichever comes first.",
  },
]

export const metadata: Metadata = {
  title: "One-Time Messages - Self-Destructing Encrypted Notes",
  description:
    "Share passwords, API keys, or sensitive notes that self-destruct after one view. End-to-end encrypted with AES-256-GCM. No accounts required.",
  keywords: [
    "one-time message",
    "self-destructing notes",
    "encrypted pastebin",
    "secure password sharing",
    "private notes",
    "burn after reading",
  ],
  openGraph: {
    title: "One-Time Messages - zkChat",
    description:
      "Share passwords, API keys, or sensitive notes that self-destruct after one view. End-to-end encrypted.",
    url: `${SITE_CONFIG.url}/otm`,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/otm`,
  },
}

export default function OTMLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(OTM_FAQ_ITEMS)),
        }}
      />
      {children}
    </>
  )
}
