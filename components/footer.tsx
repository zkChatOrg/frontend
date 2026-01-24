import Link from "next/link"
import { SiGithub, SiX } from "react-icons/si"

export function Footer() {
  return (
    <footer className="w-full py-8 px-4 border-t border-border bg-secondary/20">
      <div className="max-w-4xl mx-auto space-y-6">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Footer navigation">
          <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
            Private Chat
          </Link>
          <Link href="/otm" className="text-muted-foreground hover:text-foreground transition-colors">
            One-Time Messages
          </Link>
          <Link href="/file" className="text-muted-foreground hover:text-foreground transition-colors">
            File Drop
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/status" className="text-muted-foreground hover:text-foreground transition-colors">
            Status
          </Link>
          <Link href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
            Legal
          </Link>
        </nav>

        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/zkChatOrg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <SiGithub className="w-5 h-5" />
          </a>
          <a
            href="https://x.com/zkChatOrg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="X (Twitter)"
          >
            <SiX className="w-5 h-5" />
          </a>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40">
          © {new Date().getFullYear()} OpenZK LLC. Zero-knowledge encrypted communication. No accounts. No logs. No metadata.
        </p>
      </div>
    </footer>
  )
}
