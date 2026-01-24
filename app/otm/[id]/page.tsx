import type { Metadata } from "next"
import OTMViewClientPage from "./client-page"

export const metadata: Metadata = {
  title: "You've received a self-destructing message - zkChat",
  description: "Open to view an encrypted one-time message. It will be permanently destroyed after reading.",
  openGraph: {
    title: "You've received a self-destructing message",
    description: "Open to view an encrypted one-time message. It will be permanently destroyed after reading.",
  },
  twitter: {
    card: "summary",
    title: "You've received a self-destructing message",
    description: "Open to view an encrypted one-time message. It will be permanently destroyed after reading.",
  },
}

export default function OTMViewPage() {
  return <OTMViewClientPage />
}
