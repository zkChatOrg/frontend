import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { glossaryEntries, getGlossaryEntryBySlug } from "@/lib/seo-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return glossaryEntries.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getGlossaryEntryBySlug(slug)
  if (!data) return { title: "Not Found" }

  return {
    title: `What is ${data.term}? | Privacy Glossary | zkChat`,
    description: data.shortDefinition,
    openGraph: {
      title: `What is ${data.term}?`,
      description: data.tagline,
    },
  }
}

export default async function GlossaryPage({ params }: Props) {
  const { slug } = await params
  const data = getGlossaryEntryBySlug(slug)

  if (!data) {
    notFound()
  }

  const relatedEntries = data.relatedTerms
    .map((slug) => getGlossaryEntryBySlug(slug))
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Privacy Glossary
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {data.term}
            </h1>
            <p className="text-xl text-muted-foreground">
              {data.tagline}
            </p>
          </header>

          {/* Quick Definition */}
          <section className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h2 className="text-sm font-semibold text-primary mb-2">In Short</h2>
            <p className="text-foreground text-lg leading-relaxed">
              {data.shortDefinition}
            </p>
          </section>

          {/* Full Explanation */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Explained</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {data.fullExplanation}
            </p>
          </section>

          {/* How zkChat Uses This */}
          <section className="mb-8 p-6 bg-muted/30 rounded-xl border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">How zkChat Implements This</h2>
            <p className="text-muted-foreground leading-relaxed">
              {data.howZkChatUses}
            </p>
          </section>

          {/* Technical Details */}
          {data.technicalDetails && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Technical Details</h2>
              <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <p className="text-zinc-300 font-mono text-sm leading-relaxed">
                  {data.technicalDetails}
                </p>
              </div>
            </section>
          )}

          {/* Related Terms */}
          {relatedEntries.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Related Concepts</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedEntries.map((entry) => entry && (
                  <Link
                    key={entry.slug}
                    href={`/learn/${entry.slug}`}
                    className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {entry.term}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="text-center py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              See It In Action
            </h2>
            <p className="text-muted-foreground mb-6">
              Experience {data.term.toLowerCase()} firsthand with zkChat.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try zkChat Now <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* All Glossary Terms */}
          <section className="pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Browse All Terms</h3>
            <div className="flex flex-wrap gap-2">
              {glossaryEntries
                .filter((g) => g.slug !== slug)
                .map((g) => (
                  <Link
                    key={g.slug}
                    href={`/learn/${g.slug}`}
                    className="text-sm px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                  >
                    {g.term}
                  </Link>
                ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}
