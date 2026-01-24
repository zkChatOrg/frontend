"use client"

import { useState, useEffect } from "react"
import { X, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already dismissed
    if (typeof window === "undefined") return
    if (localStorage.getItem("zkchat_install_dismissed") === "1") return

    // Check if already in standalone mode (PWA installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) return

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)

    // Detect Android Chrome
    const isAndroid = /android/.test(userAgent)
    const isChrome = /chrome/.test(userAgent) && !/edge|edg/.test(userAgent)

    if (isIOSDevice && isSafari) {
      setIsIOS(true)
      setShowBanner(true)
      return
    }

    if (isAndroid && isChrome) {
      // Listen for beforeinstallprompt event
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShowBanner(true)
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstall)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem("zkchat_install_dismissed", "1")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 pb-[env(safe-area-inset-bottom)] left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-secondary backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-background rounded-xl flex items-center justify-center">
            {isIOS ? <Share className="h-5 w-5 text-foreground" /> : <Download className="h-5 w-5 text-foreground" />}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-sm font-medium text-foreground mb-1">Add zkChat to Home Screen</h3>
            {isIOS ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap <Share className="inline h-3 w-3 -mt-0.5 text-foreground" /> Share then{" "}
                <span className="text-foreground">"Add to Home Screen"</span> for 1-tap access.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Install for faster access and a full-screen experience.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-background/50"
          >
            Later
          </Button>
          {!isIOS && (
            <Button size="sm" onClick={handleInstall} className="flex-1 h-9 text-xs">
              Install
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
