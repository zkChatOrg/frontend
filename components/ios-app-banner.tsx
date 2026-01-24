"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

/**
 * Custom iOS App Banner for development/testing
 * Shows a banner to open the current page in the iOS app
 * Only appears on iOS devices in Safari/WebView
 */
export function IOSAppBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem("ios-banner-dismissed")

    // Check if we're on a room/otm/file page (where app opening makes sense)
    const isAppPage = window.location.pathname.startsWith("/room/") ||
                      window.location.pathname.startsWith("/otm/") ||
                      window.location.pathname.startsWith("/file/") ||
                      window.location.pathname.startsWith("/f/")

    if (isIOS && !dismissed && isAppPage) {
      // Small delay to not interfere with page load
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    sessionStorage.setItem("ios-banner-dismissed", "true")
  }

  const handleOpenApp = () => {
    // Try to open the current URL in the app via Universal Link
    // This works because the app is registered to handle these paths
    window.location.href = window.location.href
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 shadow-lg">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">zk</span>
          </div>
          <div>
            <div className="font-semibold text-sm">zkChat App</div>
            <div className="text-xs text-blue-100">Open in app for better experience</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenApp}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Open
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-500 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
