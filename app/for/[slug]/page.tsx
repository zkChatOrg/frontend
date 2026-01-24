import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Shield, Check, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { useCases, getUseCaseBySlug } from "@/lib/seo-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return useCases.map((u) => ({ slug: u.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getUseCaseBySlug(slug)
  if (!data) return { title: "Not Found" }

  return {
    title: `${data.title} | zkChat`,
    description: data.tagline + ". " + data.description,
    openGraph: {
      title: data.title,
      description: data.tagline,
    },
  }
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params
  const data = getUseCaseBySlug(slug)

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
            <p className="text-sm font-medium text-primary mb-2">{data.profession}</p>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {data.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {data.tagline}
            </p>
          </header>

          {/* Introduction */}
          <section className="mb-12 p-6 bg-muted/30 rounded-xl border border-border">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {data.description}
            </p>
          </section>

          {/* Challenges & Solutions */}
          <section className="mb-12 grid md:grid-cols-2 gap-8">
            {/* Challenges */}
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Security Challenges
              </h2>
              <ul className="space-y-3">
                {data.challenges.map((challenge, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-3">
                    <span className="text-red-500 font-bold">!</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                How zkChat Helps
              </h2>
              <ul className="space-y-3">
                {data.solutions.map((solution, i) => (
                  <li key={i} className="text-foreground flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Key Features for {data.profession}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.features.map((feature, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-foreground font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Common Use Cases</h2>
            <div className="space-y-3">
              {data.useCases.map((useCase, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-foreground">{useCase}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 bg-muted/30 rounded-xl border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Start Communicating Securely
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              No signup, no phone number, no app to install. Create a secure room and share the link.
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

          {/* Other Use Cases */}
          <section className="pt-8 mt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Explore Other Use Cases</h3>
            <div className="flex flex-wrap gap-2">
              {useCases
                .filter((u) => u.slug !== slug)
                .map((u) => (
                  <Link
                    key={u.slug}
                    href={`/for/${u.slug}`}
                    className="text-sm px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                  >
                    {u.profession}
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
