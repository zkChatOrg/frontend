import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/seo"
import ClientChatPage from "./client-page"

export const metadata: Metadata = {
  title: "Private Chat Rooms - End-to-End Encrypted Group Messaging",
  description:
    "Create military-grade encrypted chat rooms that self-destruct. No accounts, no metadata, no logs. AES-256-GCM encryption with zero-knowledge architecture.",
  keywords: [
    "encrypted chat room",
    "private group chat",
    "self-destructing messages",
    "anonymous chat",
    "secure messaging",
    "end-to-end encryption",
  ],
  openGraph: {
    title: "Private Chat Rooms - zkChat",
    description: "Create military-grade encrypted chat rooms that self-destruct. No accounts, no metadata, no logs.",
    url: `${SITE_CONFIG.url}/chat`,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/chat`,
  },
}

export default function ChatPage() {
  return <ClientChatPage />
}
