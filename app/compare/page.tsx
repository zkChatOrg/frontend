import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Footer } from "@/components/footer"
import { comparisons } from "@/lib/seo-data"

export const metadata: Metadata = {
  title: "Compare zkChat vs Other Messengers | Secure Messaging Comparison",
  description: "See how zkChat compares to Signal, Telegram, WhatsApp, and other messaging apps. Compare privacy features, encryption, and security.",
}

export default function ComparePage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Compare zkChat
          </h1>
          <p className="text-xl text-muted-foreground">
            See how zkChat stacks up against other secure messaging apps
          </p>
        </header>

        <div className="grid gap-6">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="p-6 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    zkChat vs {c.name}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {c.tagline}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
