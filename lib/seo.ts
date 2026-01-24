export const SITE_CONFIG = {
  name: "zkChat",
  url: "https://www.zkchat.org",
  title: "zkChat - Military-Grade Privacy For Everyday",
  description:
    "Ephemeral end-to-end encrypted chat, file-drop, and one-time messages. No accounts. No metadata. No logs. No identities. Everything burns the moment you leave.",
  twitterHandle: "@zkChatOrg",
  locale: "en_US",
  themeColor: "#000000",
} as const

export function generateCanonicalUrl(path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${SITE_CONFIG.url}${cleanPath}`
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "zkChat",
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/favicon.svg`,
    sameAs: ["https://x.com/zkChatOrg"],
    description: SITE_CONFIG.description,
  }
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateSoftwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "zkChat",
    applicationCategory: "CommunicationApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: SITE_CONFIG.description,
    featureList: [
      "End-to-end encryption with AES-256-GCM",
      "Zero-knowledge architecture",
      "Ephemeral chat rooms",
      "One-time messages",
      "Private file drop",
      "No accounts required",
      "No metadata logging",
    ],
  }
}

export function generateArticleSchema(article: {
  title: string
  description: string
  date: string
  slug: string
  tags: string[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: "zkChat",
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: "zkChat",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/blog/${article.slug}`,
    },
    keywords: article.tags.join(", "),
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateHowToSchema(steps: { name: string; text: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use zkChat for private communication",
    description: "Step-by-step guide to using zkChat for encrypted, ephemeral messaging",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}
