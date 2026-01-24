import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Repeat } from "lucide-react"
import { Footer } from "@/components/footer"
import { alternatives } from "@/lib/seo-data"

export const metadata: Metadata = {
  title: "Private Alternatives to Popular Messaging Apps | zkChat",
  description: "Looking for a more private alternative to WhatsApp, Telegram, Signal, Discord, or Slack? Compare zkChat's zero-knowledge encrypted messaging to popular apps.",
}

export default function AlternativesIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Alternatives</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Private Alternatives to Popular Messaging Apps
          </h1>
          <p className="text-xl text-muted-foreground">
            Find a more private way to communicate with zero-knowledge encryption
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alternatives.map((a) => (
            <Link
              key={a.slug}
              href={`/alternative-to/${a.slug}`}
              className="p-5 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all group"
            >
              <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                {a.name} Alternative
              </h2>
              <p className="text-sm text-muted-foreground">
                {a.tagline}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
