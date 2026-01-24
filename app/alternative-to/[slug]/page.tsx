import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Check, ArrowRight, AlertTriangle } from "lucide-react"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { alternatives, getAlternativeBySlug } from "@/lib/seo-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getAlternativeBySlug(slug)
  if (!data) return { title: "Not Found" }

  return {
    title: `Best ${data.name} Alternative for Privacy | zkChat`,
    description: `Looking for a private ${data.name} alternative? ${data.tagline}. Zero-knowledge encryption, no account required.`,
    openGraph: {
      title: `${data.name} Alternative — zkChat`,
      description: data.tagline,
    },
  }
}

export default async function AlternativePage({ params }: Props) {
  const { slug } = await params
  const data = getAlternativeBySlug(slug)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/alternative-to"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All Alternatives
        </Link>

        <article>
          {/* Header */}
          <header className="mb-12">
            <p className="text-sm font-medium text-primary mb-2">Private Alternative</p>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Best {data.name} Alternative for Privacy
            </h1>
            <p className="text-xl text-muted-foreground">
              {data.tagline}
            </p>
          </header>

          {/* Description */}
          <section className="mb-12 p-6 bg-muted/30 rounded-xl border border-border">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {data.description}
            </p>
          </section>

          {/* Why Switch */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Why Switch from {data.name}?</h2>
            <div className="space-y-3">
              {data.whySwitch.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">{reason}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fair Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Where {data.name} Still Wins</h2>
            <div className="p-6 bg-muted/30 rounded-xl border border-border">
              <ul className="space-y-3">
                {data.limitations.map((item, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-3">
                    <span className="text-muted-foreground font-bold mt-0.5">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* zkChat Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">What zkChat Offers Instead</h2>
            <div className="space-y-3">
              {data.zkChatBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-green-500/5 rounded-lg border border-green-500/10">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Switch?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              No signup, no phone number, no app to install. Start using zkChat in seconds.
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

          {/* Other Alternatives */}
          <section className="pt-8 mt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Explore Other Alternatives</h3>
            <div className="flex flex-wrap gap-2">
              {alternatives
                .filter((a) => a.slug !== slug)
                .map((a) => (
                  <Link
                    key={a.slug}
                    href={`/alternative-to/${a.slug}`}
                    className="text-sm px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                  >
                    {a.name} Alternative
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
