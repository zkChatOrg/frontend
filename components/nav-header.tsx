"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, MessageSquareCode as MessageSquareLock, Upload, Newspaper } from "lucide-react"

export function NavHeader() {
  const pathname = usePathname()
  const isOtm = pathname?.startsWith("/otm")
  const isFile = pathname?.startsWith("/file") || pathname?.startsWith("/f/")
  const isRoom = pathname?.startsWith("/room/")
  const isChat = pathname === "/chat"

  const isBlog = pathname?.startsWith("/blog")
  const isLanding = pathname === "/"

  if (isRoom) {
    return null
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" scroll={true} className="flex items-center gap-2 text-lg font-medium text-foreground">
            <span
              className="block w-[84px] h-[28px] bg-current"
              style={{
                maskImage: "url(/zkchat-head.svg)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url(/zkchat-head.svg)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
              aria-hidden="true"
            />
            <span className="sr-only">zkChat</span>
          </Link>
          <Link
            href="/blog"
            scroll={true}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isBlog ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Blog"
          >
            <Newspaper className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
        </div>

        <nav className="flex items-center gap-1 bg-secondary/50 rounded-full p-1">
          <Link
            href="/chat"
            scroll={true}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isChat ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
          <Link
            href="/otm"
            scroll={true}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isOtm ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquareLock className="w-4 h-4" />
            <span className="hidden sm:inline">Pastebin</span>
          </Link>
          <Link
            href="/file"
            scroll={true}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isFile ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">File Drop</span>
          </Link>

        </nav>
      </div>
    </header>
  )
}
