import type { Metadata } from "next"
import FileViewerClientPage from "./client-page"

export const metadata: Metadata = {
  title: "You've received an encrypted file - zkChat",
  description: "Download an end-to-end encrypted file. It will be permanently destroyed after viewing.",
  openGraph: {
    title: "You've received an encrypted file",
    description: "Download an end-to-end encrypted file. It will be permanently destroyed after viewing.",
  },
  twitter: {
    card: "summary",
    title: "You've received an encrypted file",
    description: "Download an end-to-end encrypted file. It will be permanently destroyed after viewing.",
  },
}

export default function FileViewerPage() {
  return <FileViewerClientPage />
}
