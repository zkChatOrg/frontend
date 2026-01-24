"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"

interface QrModalProps {
  open: boolean
  onClose: () => void
  value: string
  title?: string
  subtitle?: string
}

export function QrModal({ open, onClose, value, title, subtitle }: QrModalProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !value) return

    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement
    if (!canvas) return

    QRCode.toCanvas(canvas, value, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
  }, [open, value])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-zinc-900 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="flex flex-col items-center gap-4 mt-2">
          {title && <h3 className="text-lg font-semibold text-white text-center">{title}</h3>}

          <div className="bg-white p-4 rounded-xl">
            <canvas id="qr-canvas" />
          </div>

          {subtitle && <p className="text-sm text-zinc-400 text-center leading-relaxed">{subtitle}</p>}

          <Button onClick={onClose} className="w-full rounded-xl h-11 bg-white text-black hover:bg-zinc-200">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
