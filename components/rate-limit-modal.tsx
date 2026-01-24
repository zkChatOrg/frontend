"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface RateLimitModalProps {
  onClose: () => void
}

export function RateLimitModal({ onClose }: RateLimitModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
            <AlertTriangle className="w-5 h-5 text-foreground" />
          </div>
          <h2 className="text-xl font-medium text-foreground">Too many requests</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You're creating or viewing messages too quickly. Please wait a moment and try again.
        </p>
        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="rounded-xl h-11 px-6">
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
