import type { Metadata } from "next"
import Link from "next/link"
import { getAllPosts } from "@/lib/blog-posts"
import { Footer } from "@/components/footer"
import { Newspaper } from "lucide-react"
import { SITE_CONFIG, generateBreadcrumbSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Blog - Privacy, Encryption & Zero-Knowledge Tools",
  description:
    "Learn how zkChat works: end-to-end encryption, AES-256-GCM, URL fragment keys, and why donations matter for ad-free privacy tools.",
  keywords: [
    "privacy blog",
    "encryption tutorials",
    "zero-knowledge",
    "end-to-end encryption explained",
    "secure messaging guide",
  ],
  openGraph: {
    title: "Blog - zkChat",
    description:
      "Learn how zkChat works: end-to-end encryption, AES-256-GCM, URL fragment keys, and why donations matter for ad-free privacy tools.",
    url: `${SITE_CONFIG.url}/blog`,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Newspaper className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl font-medium text-foreground tracking-tight">Blog</h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
              Updates, deep dives and guides on private communication, one-time messages and zero-knowledge tools.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm" aria-label="Quick links">
            <Link
              href="/chat"
              className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              Private Chat
            </Link>
            <Link
              href="/otm"
              className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              One-Time Messages
            </Link>
            <Link
              href="/file"
              className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              File Drop
            </Link>
          </nav>

          {/* Posts Grid */}
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block bg-background border border-border rounded-2xl p-6 hover:border-foreground/20 hover:shadow-sm transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <time className="text-xs text-muted-foreground" dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-medium text-foreground hover:text-foreground/80 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
