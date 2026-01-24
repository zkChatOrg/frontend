import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Shield } from "lucide-react"
import { Footer } from "@/components/footer"
import { useCases } from "@/lib/seo-data"

export const metadata: Metadata = {
  title: "Secure Messaging for Every Profession | zkChat Use Cases",
  description: "Discover how journalists, lawyers, healthcare providers, activists, and other professionals use zkChat for secure, private communication.",
}

export default function UseCasesPage() {
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
            zkChat for Your Industry
          </h1>
          <p className="text-xl text-muted-foreground">
            Privacy-first secure messaging for professionals who need confidentiality
          </p>
        </header>

        <div className="grid gap-6">
          {useCases.map((u) => (
            <Link
              key={u.slug}
              href={`/for/${u.slug}`}
              className="p-6 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{u.profession}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {u.title}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {u.tagline}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
