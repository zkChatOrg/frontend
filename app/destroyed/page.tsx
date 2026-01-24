"use client"

import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

// Note: This page intentionally has minimal SEO as it's a post-action confirmation page
export default function DestroyedPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <ShieldCheck className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl font-medium text-foreground tracking-tight text-balance">Room destroyed</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              Your messages never touched a server. Everything was encrypted end-to-end and has been permanently
              deleted.
            </p>
          </div>

          <div className="pt-4 space-y-4">
            <Link href="/">
              <Button
                size="lg"
                className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
              >
                Back to Home
              </Button>
            </Link>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
                Create new room
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/otm" className="text-muted-foreground hover:text-foreground transition-colors">
                One-time message
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/file" className="text-muted-foreground hover:text-foreground transition-colors">
                File drop
              </Link>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xs text-muted-foreground">No logs. No history. No recovery possible.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
