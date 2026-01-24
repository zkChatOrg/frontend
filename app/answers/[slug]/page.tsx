import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, HelpCircle, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { faqEntries, getFAQBySlug } from "@/lib/seo-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return faqEntries.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getFAQBySlug(slug)
  if (!data) return { title: "Not Found" }

  return {
    title: `${data.question} | Encrypted Messaging FAQ | zkChat`,
    description: data.shortAnswer,
    openGraph: {
      title: data.question,
      description: data.shortAnswer,
    },
  }
}

export default async function FAQPage({ params }: Props) {
  const { slug } = await params
  const data = getFAQBySlug(slug)

  if (!data) {
    notFound()
  }

  const relatedQuestions = data.relatedQuestions
    .map((s) => getFAQBySlug(s))
    .filter(Boolean)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: data.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: data.shortAnswer + " " + data.detailedAnswer,
        },
      },
      ...relatedQuestions
        .filter(Boolean)
        .map((entry) => ({
          "@type": "Question",
          name: entry!.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry!.shortAnswer,
          },
        })),
    ],
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/answers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All Questions
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {data.category}
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {data.question}
            </h1>
          </header>

          {/* Short Answer */}
          <section className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h2 className="text-sm font-semibold text-primary mb-2">Quick Answer</h2>
            <p className="text-foreground text-lg leading-relaxed">
              {data.shortAnswer}
            </p>
          </section>

          {/* Detailed Answer */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Detailed Explanation</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {data.detailedAnswer}
            </p>
          </section>

          {/* Related Questions */}
          {relatedQuestions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Related Questions</h2>
              <div className="space-y-3">
                {relatedQuestions.map((entry) => entry && (
                  <Link
                    key={entry.slug}
                    href={`/answers/${entry.slug}`}
                    className="block p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {entry.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {entry.shortAnswer}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="text-center py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Try It Yourself
            </h2>
            <p className="text-muted-foreground mb-6">
              Experience military-grade encrypted messaging. No signup, no phone number, no app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create Secure Room <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/otm"
                className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Send One-Time Message
              </Link>
            </div>
          </section>

          {/* Browse All Questions */}
          <section className="pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Browse All Questions</h3>
            <div className="flex flex-wrap gap-2">
              {faqEntries
                .filter((f) => f.slug !== slug)
                .slice(0, 12)
                .map((f) => (
                  <Link
                    key={f.slug}
                    href={`/answers/${f.slug}`}
                    className="text-sm px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                  >
                    {f.question.replace(/\?$/, "")}
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
