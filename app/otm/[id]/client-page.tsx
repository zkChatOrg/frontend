"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Copy, Check, Eye, AlertTriangle, ShieldAlert, MessageSquareCode as MessageSquareLock } from "lucide-react"
import { decryptMessage } from "@/lib/crypto"
import { Footer } from "@/components/footer"
import { RateLimitModal } from "@/components/rate-limit-modal"
import { getApiBase } from "@/lib/api"

type Status = "idle" | "loading" | "loaded" | "used" | "error" | "missingKey"

export default function OTMViewClientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState<string>("")
  const [showWarning, setShowWarning] = useState(false)
  const [showRateLimit, setShowRateLimit] = useState(false)

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const hashParams = new URLSearchParams(hash)
    const key = hashParams.get("key")

    if (!key || key.trim() === "") {
      setStatus("missingKey")
      return
    }

    setEncryptionKey(key)
    setShowWarning(true)
  }, [])

  const handleConfirm = async () => {
    setShowWarning(false)
    if (!encryptionKey || hasFetchedRef.current) return

    hasFetchedRef.current = true
    setStatus("loading")

    try {
      const response = await fetch(`${getApiBase()}/otm/${id}`)

      if (response.status === 429) {
        setStatus("idle")
        setShowRateLimit(true)
        hasFetchedRef.current = false
        return
      }

      if (!response.ok) {
        setStatus("used")
        return
      }

      const data = await response.json()

      if (data.used) {
        setStatus("used")
        return
      }

      const [iv, ciphertext] = data.ciphertext.split(".")
      const decrypted = await decryptMessage(iv, ciphertext, encryptionKey)
      const payload = JSON.parse(decrypted)

      setMessage(payload.text)
      setStatus("loaded")
    } catch (err) {
      console.error("Failed to fetch/decrypt OTM:", err)
      setStatus("error")
      setErrorMsg("Failed to decrypt message. The link may be invalid.")
    }
  }

  const copyMessage = async () => {
    if (message) {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                <AlertTriangle className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-xl font-medium text-foreground">One-Time Message</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This message will be permanently destroyed after you view it. It can only be read once and cannot be
              recovered.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => router.push("/otm")} variant="outline" className="flex-1 rounded-xl h-11">
                Cancel
              </Button>
              <Button onClick={handleConfirm} className="flex-1 rounded-xl h-11">
                I Understand
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRateLimit && <RateLimitModal onClose={() => setShowRateLimit(false)} />}

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="max-w-xl w-full space-y-8">
          {status === "missingKey" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-medium text-foreground">Invalid one-time link</h1>
                <p className="text-muted-foreground">
                  The decryption key is missing. This message cannot be opened from this URL.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push("/otm")}
                className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
              >
                <MessageSquareLock className="w-5 h-5 mr-2" />
                Create new one-time message
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary animate-pulse">
                <Eye className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl font-medium text-foreground">Decrypting...</h1>
              <p className="text-muted-foreground">Decrypting one-time message...</p>
            </div>
          )}

          {status === "loaded" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-2">
                  <Eye className="w-8 h-8 text-foreground" />
                </div>
                <h1 className="text-3xl font-medium text-foreground">One-Time Message</h1>
                <p className="text-sm text-muted-foreground">
                  This message was decrypted locally and will not be stored.
                </p>
              </div>
              <div className="bg-secondary rounded-2xl p-6 space-y-4">
                <div className="bg-background rounded-xl p-4 text-foreground whitespace-pre-wrap break-words min-h-[100px]">
                  {message}
                </div>
                <div className="flex gap-3">
                  <Button onClick={copyMessage} variant="outline" className="flex-1 rounded-xl h-12 bg-transparent">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Message
                      </>
                    )}
                  </Button>
                  <Button onClick={() => router.push("/otm")} className="flex-1 rounded-xl h-12">
                    <MessageSquareLock className="w-4 h-4 mr-2" />
                    Create Your Own
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === "used" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
                <ShieldAlert className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-medium text-foreground">This message is gone</h1>
                <p className="text-muted-foreground">This one-time message has already been viewed or has expired.</p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push("/otm")}
                className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
              >
                <MessageSquareLock className="w-5 h-5 mr-2" />
                Create a new one-time message
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-medium text-foreground">Invalid one-time link</h1>
                <p className="text-muted-foreground">
                  {errorMsg || "The decryption key is missing, or the link is malformed."}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push("/otm")}
                className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
              >
                <MessageSquareLock className="w-5 h-5 mr-2" />
                Create a new one-time message
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
