import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Check, X, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { comparisons, getComparisonBySlug } from "@/lib/seo-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getComparisonBySlug(slug)
  if (!data) return { title: "Not Found" }

  return {
    title: `zkChat vs ${data.name} - Secure Messaging Comparison | zkChat`,
    description: data.tagline + ". Compare features, privacy, encryption, and more.",
    openGraph: {
      title: `zkChat vs ${data.name} - Which is More Private?`,
      description: data.description,
    },
  }
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params
  const data = getComparisonBySlug(slug)

  if (!data) {
    notFound()
  }

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

        <article>
          {/* Header */}
          <header className="mb-12">
            <p className="text-sm font-medium text-primary mb-2">Comparison</p>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              zkChat vs {data.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              {data.tagline}
            </p>
          </header>

          {/* Quick Summary */}
          <section className="mb-12 p-6 bg-muted/30 rounded-xl border border-border">
            <p className="text-muted-foreground leading-relaxed">
              {data.description}
            </p>
          </section>

          {/* Feature Comparison Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">{data.name}</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary">zkChat</th>
                  </tr>
                </thead>
                <tbody>
                  {data.features.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-4 px-4 font-medium text-foreground">{row.feature}</td>
                      <td className="py-4 px-4 text-muted-foreground">{row.competitor}</td>
                      <td className="py-4 px-4 text-foreground">{row.zkchat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pros and Cons Grid */}
          <section className="mb-12 grid md:grid-cols-2 gap-8">
            {/* Competitor */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">{data.name}</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-green-500 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {data.pros.map((pro, i) => (
                      <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">+</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                    <X className="w-4 h-4" /> Limitations
                  </h4>
                  <ul className="space-y-2">
                    {data.cons.map((con, i) => (
                      <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">-</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* zkChat */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">zkChat Advantages</h3>
              <ul className="space-y-3">
                {data.zkChatAdvantages.map((adv, i) => (
                  <li key={i} className="text-foreground flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-12 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h2 className="text-xl font-bold text-foreground mb-3">The Verdict</h2>
            <p className="text-muted-foreground leading-relaxed">
              {data.verdict}
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to try zkChat?
            </h2>
            <p className="text-muted-foreground mb-6">
              No signup required. Start a secure conversation in seconds.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Create Secure Room <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Other Comparisons */}
          <section className="pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">More Comparisons</h3>
            <div className="flex flex-wrap gap-2">
              {comparisons
                .filter((c) => c.slug !== slug)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/compare/${c.slug}`}
                    className="text-sm px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                  >
                    vs {c.name}
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
