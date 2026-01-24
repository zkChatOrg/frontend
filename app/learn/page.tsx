import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Footer } from "@/components/footer"
import { glossaryEntries } from "@/lib/seo-data"

export const metadata: Metadata = {
  title: "Privacy & Encryption Glossary | Learn About Secure Messaging | zkChat",
  description: "Learn about end-to-end encryption, zero-knowledge architecture, AES-256-GCM, and other privacy concepts. Understand how secure messaging works.",
}

export default function GlossaryIndexPage() {
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
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Privacy Glossary</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Learn About Privacy & Encryption
          </h1>
          <p className="text-xl text-muted-foreground">
            Understand the technology that keeps your communications secure
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          {glossaryEntries.map((g) => (
            <Link
              key={g.slug}
              href={`/learn/${g.slug}`}
              className="p-5 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all group"
            >
              <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                {g.term}
              </h2>
              <p className="text-sm text-muted-foreground">
                {g.tagline}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
