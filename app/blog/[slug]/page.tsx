import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPostBySlug, getAllPosts } from "@/lib/blog-posts"
import { Footer } from "@/components/footer"
import { ChevronLeft } from "lucide-react"
import { SITE_CONFIG, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo"
import type { JSX } from "react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: "Post not found",
    }
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: "zkChat", url: SITE_CONFIG.url }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${SITE_CONFIG.url}/blog/${slug}`,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ["zkChat"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// ... existing code for renderMarkdown and parseInlineMarkdown ...

function renderMarkdown(content: string): JSX.Element[] {
  const lines = content.split("\n")
  const elements: JSX.Element[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Markdown table parsing
    if (line.startsWith("|") && line.includes("|")) {
      const tableRows: string[][] = []
      let hasHeader = false

      while (i < lines.length && lines[i].startsWith("|")) {
        const row = lines[i]
        if (row.match(/^\|[\s\-:|]+\|$/)) {
          hasHeader = true
          i++
          continue
        }
        const cells = row
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim())
        tableRows.push(cells)
        i++
      }

      if (tableRows.length > 0) {
        const headerRow = hasHeader ? tableRows[0] : null
        const bodyRows = hasHeader ? tableRows.slice(1) : tableRows

        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto mb-6 -mx-4 px-4">
            <table className="min-w-full text-sm border-collapse">
              {headerRow && (
                <thead>
                  <tr className="border-b border-border">
                    {headerRow.map((cell, idx) => (
                      <th key={idx} className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">
                        {parseInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-border/50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xl font-medium text-foreground tracking-tight mb-3 mt-6">
          {line.slice(4)}
        </h3>,
      )
      i++
      continue
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-medium text-foreground tracking-tight mb-4 mt-8">
          {line.slice(3)}
        </h2>,
      )
      i++
      continue
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-3xl font-semibold text-foreground tracking-tight mb-6 mt-8">
          {line.slice(2)}
        </h1>,
      )
      i++
      continue
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(
        <pre key={`code-${i}`} className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto mb-6">
          <code className="text-sm font-mono">{codeLines.join("\n")}</code>
        </pre>,
      )
      continue
    }

    if (line.startsWith("- ")) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc list-inside space-y-2 text-muted-foreground mb-6 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-2 text-muted-foreground mb-6 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    if (line.trim() === "") {
      i++
      continue
    }

    elements.push(
      <p key={`p-${i}`} className="text-muted-foreground leading-relaxed mb-6">
        {parseInlineMarkdown(line)}
      </p>,
    )
    i++
  }

  return elements
}

function parseInlineMarkdown(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let keyCounter = 0

  while (remaining.length > 0) {
    // Link parsing - [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      const linkText = linkMatch[1]
      const linkUrl = linkMatch[2]
      const isExternal = linkUrl.startsWith("http")
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={linkUrl}
          className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {linkText}
        </a>,
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/)
    if (boldMatch) {
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-semibold text-foreground">
          {boldMatch[2]}
        </strong>,
      )
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    const italicMatch = remaining.match(/^(?<!_)_([^_]+?)_(?!_)/)
    if (italicMatch) {
      parts.push(
        <em key={`italic-${keyCounter++}`} className="italic">
          {italicMatch[1]}
        </em>,
      )
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    const codeMatch = remaining.match(/^`(.*?)`/)
    if (codeMatch) {
      parts.push(
        <code
          key={`code-${keyCounter++}`}
          className="bg-secondary text-foreground px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {codeMatch[1]}
        </code>,
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    parts.push(remaining[0])
    remaining = remaining.slice(1)
  }

  return parts
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description,
    date: post.date,
    slug: post.slug,
    tags: post.tags,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
    { name: post.title, url: `${SITE_CONFIG.url}/blog/${post.slug}` },
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <div className="flex-1">
        <article className="max-w-2xl mx-auto px-4 py-12">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to blog
          </Link>

          {/* Post header */}
          <header className="mb-8 space-y-4">
            <h1 className="text-4xl font-semibold text-foreground tracking-tight leading-tight text-balance">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <time className="text-sm text-muted-foreground" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Post content */}
          <div className="prose prose-sm max-w-none">{renderMarkdown(post.content)}</div>

          <nav className="mt-12 pt-8 border-t border-border" aria-label="Related tools">
            <h3 className="text-lg font-medium text-foreground mb-4">Try zkChat Tools</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm"
              >
                Private Chat Rooms
              </Link>
              <Link
                href="/otm"
                className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm"
              >
                One-Time Messages
              </Link>
              <Link
                href="/file"
                className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm"
              >
                Private File Drop
              </Link>
            </div>
          </nav>


        </article>
      </div>
      <Footer />
    </div>
  )
}
