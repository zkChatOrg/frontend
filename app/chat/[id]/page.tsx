import { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/seo"
import ClientChatInvitePage from "./client-page"

export const metadata: Metadata = {
  title: "Chat Invite - zkChat",
  description: "You've been invited to a private, end-to-end encrypted chat on zkChat.",
  openGraph: {
    title: "Chat Invite - zkChat",
    description: "You've been invited to a private, end-to-end encrypted chat on zkChat.",
    url: `${SITE_CONFIG.url}/chat`,
  },
}

export default function ChatInvitePage() {
  return <ClientChatInvitePage />
}
