import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { Footer } from "@/components/footer"
import { faqEntries, getFAQCategories } from "@/lib/seo-data"

export const metadata: Metadata = {
  title: "Encrypted Messaging FAQ | Privacy & Security Questions | zkChat",
  description: "Answers to frequently asked questions about encrypted messaging, privacy, metadata, zero-knowledge architecture, and secure communication.",
}

export default function FAQIndexPage() {
  const categories = getFAQCategories()

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.shortAnswer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
            <HelpCircle className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Encrypted Messaging Questions & Answers
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about private, encrypted communication
          </p>
        </header>

        {categories.map((category) => (
          <section key={category} className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">{category}</h2>
            <div className="space-y-3">
              {faqEntries
                .filter((f) => f.category === category)
                .map((f) => (
                  <Link
                    key={f.slug}
                    href={`/answers/${f.slug}`}
                    className="block p-5 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all group"
                  >
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {f.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {f.shortAnswer}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  )
}
