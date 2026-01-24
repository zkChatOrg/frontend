"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Copy,
  Check,
  Lock,
  ShieldCheck,
  Timer,
  Eye,
  MessageSquareCode as MessageSquareLock,
  QrCode,
  RotateCcw,
  Shield,
  Key,
  Hash,
  Server,
  EyeOff,
  Trash2,
} from "lucide-react"
import { generateEncryptionKey, encryptMessage } from "@/lib/crypto"
import { getApiBase } from "@/lib/api"
import { Footer } from "@/components/footer"
import { RateLimitModal } from "@/components/rate-limit-modal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { QrModal } from "@/components/qr-modal"

const MAX_MESSAGE_LENGTH = 8000

const OTM_FAQ_ITEMS = [
  {
    question: "What are common use cases for one-time messages?",
    answer:
      "One-time messages are perfect for sharing sensitive information that should only be read once: sharing passwords or access codes temporarily, sending API keys or authentication tokens securely, distributing private invitation links or URLs, sharing temporary Wi-Fi passwords with guests, sending confidential data like social security numbers or account numbers, sharing cryptocurrency wallet recovery phrases or private keys, distributing one-time verification codes, sending banking details or credit card information temporarily. Any scenario where you need to share a secret that must self-destruct after being viewed once is ideal for encrypted one-time messages.",
  },
  {
    question: "What is a one-time message?",
    answer:
      "A one-time message is a single-use, end-to-end encrypted secret sent as a link. The message is encrypted client-side in your browser using AES-256-GCM before being uploaded to the server. Once the recipient opens the link and the ciphertext is delivered, the server immediately and permanently deletes it. The message cannot be opened again—it's a true self-destructing message link.",
  },
  {
    question: "When should I use a one-time message instead of a group room?",
    answer:
      "One-time messages are ideal for sending a single confidential note that needs to self-destruct after being read: passwords or access codes, private URLs or invite links, API keys or tokens, short personal messages or one-off secrets. Group rooms are for real-time conversations with multiple people, while one-time encrypted notes are perfect for sharing a secure link that deletes itself. Use this zero-knowledge one-time message feature when you need a single secret to disappear forever after one read.",
  },
  {
    question: "Can I send passwords or sensitive data with one-time messages?",
    answer:
      "Yes, one-time messages are suitable for sensitive values like passwords, access codes, or private URLs because they use client-side AES-256-GCM encryption, the decryption key stays in the URL fragment (#key=...) which browsers never transmit to servers, and the ciphertext is permanently deleted after first read or expiration. However, you should still follow good security practices: rotate secrets after sharing, use time-limited credentials when possible, and verify the recipient before sending.",
  },
  {
    question: "How long is a one-time message valid?",
    answer:
      "A one-time message remains valid until the first successful read OR until it automatically expires after 7 days, whichever comes first. After either event, the encrypted blob is permanently removed from the server and the link will show that the message was already viewed or expired. There is no way to recover an expired or consumed one-time secret link.",
  },
  {
    question: "What happens if someone clicks my link twice?",
    answer:
      "First click: The server returns the ciphertext, immediately deletes it from storage, and your browser decrypts the message. Any subsequent clicks: The server no longer has the message and will respond that it was already viewed or expired. This ensures the one-time encrypted note truly self-destructs after a single read—no second chances.",
  },
  {
    question: "Can zkChat or the server read my one-time messages?",
    answer:
      "No, it's mathematically impossible for zkChat or the server to read your one-time messages because encryption happens in your browser using AES-256-GCM before the message ever leaves your device, the decryption key is embedded in the URL fragment (#key=...) which browsers never transmit to servers, and the server only ever sees the message ID and encrypted ciphertext—never the plaintext or the key. We have zero knowledge about message content. Even if compelled, we cannot decrypt what we don't have the key for.",
  },
  {
    question: "What if I lose the link or the #key part?",
    answer:
      "If you lose the complete link with the #key fragment, the ciphertext cannot be decrypted by anyone. There is no password reset, no recovery mechanism, and no way for zkChat to restore access to the message. This 'no reset, no recovery' limitation is the trade-off for strong end-to-end encryption and zero-knowledge privacy. Always store one-time message links securely until the recipient has opened them.",
  },
]

export default function OTMPage() {
  const [message, setMessage] = useState("")
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRateLimit, setShowRateLimit] = useState(false)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const generateLink = async () => {
    if (!message.trim()) {
      setError("Message cannot be empty")
      return
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Generate encryption key
      const encryptionKey = generateEncryptionKey()

      // Build payload
      const payload = {
        type: "otm",
        text: message,
        createdAt: Date.now(),
      }

      // Encrypt message
      const { iv, ciphertext } = await encryptMessage(JSON.stringify(payload), encryptionKey)

      // Call OTM API
      const response = await fetch(`${getApiBase()}/otm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext: `${iv}.${ciphertext}`,
        }),
      })

      if (response.status === 429) {
        setShowRateLimit(true)
        return
      }

      if (!response.ok) throw new Error("Failed to create one-time message")

      const { id } = await response.json()

      // Build shareable link with key in fragment
      const fragment = `key=${encryptionKey}`
      const generatedLink = `${window.location.origin}/otm/${id}#${fragment}`
      setLink(generatedLink)
    } catch (err) {
      console.error("Failed to generate link:", err)
      setError("Failed to create one-time message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (link) {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const reset = () => {
    setMessage("")
    setLink(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showRateLimit && <RateLimitModal onClose={() => setShowRateLimit(false)} />}
      {showQr && (
        <QrModal
          open={showQr}
          onClose={() => setShowQr(false)}
          value={link || ""}
          title="Scan on your phone"
          subtitle="Use this QR code to open the one-time message on another device. Think of it as a private airdrop."
        />
      )}

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <MessageSquareLock className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-5xl font-medium text-foreground tracking-tight text-balance">One-Time Message</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              Secure pastebin for secrets. Share passwords, API keys, or sensitive notes that self-destruct after one
              view.
            </p>
          </div>

          {!link ? (
            <div className="pt-4 space-y-6">
              <div className="bg-secondary/30 rounded-2xl p-6 space-y-4 text-left">
                <label htmlFor="message" className="text-sm font-medium text-foreground block">
                  Your Secret Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    setError(null)
                  }}
                  className="min-h-[200px] resize-none bg-background border-border"
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Never stored in plaintext
                  </span>
                  <span>
                    {message.length} / {MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Button
                size="lg"
                onClick={generateLink}
                disabled={loading || !message.trim()}
                className="w-full rounded-full h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
              >
                {loading ? "Generating..." : "Generate Link"}
              </Button>

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  AES-256-GCM
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Read once
                </span>
                <span className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  Auto-expire (7 days)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="bg-secondary rounded-2xl p-6 space-y-4">
                <p className="text-sm font-medium text-foreground">Your one-time link is ready</p>
                <p className="text-xs text-muted-foreground">
                  This message will self-destruct after being opened once or after expiring
                </p>
                <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground break-all">
                  {link}
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyLink} variant="outline" className="flex-1 rounded-xl h-12 bg-transparent">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowQr(true)}
                    variant="outline"
                    className="flex-1 rounded-xl h-12 bg-transparent"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR
                  </Button>
                  <Button onClick={reset} variant="outline" className="rounded-xl h-12 bg-transparent px-4">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link securely. Once opened, the message is permanently destroyed.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-secondary/30">
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">How One-Time Messages Work</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Server-blind encryption with single-read enforcement
            </p>
          </div>

          {/* OTM Flow Diagram */}
          <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm md:text-base font-medium text-foreground text-center">Message Lifecycle</h3>
            <div className="flex flex-col gap-3.5 md:gap-4 text-sm md:text-sm font-mono">
              {/* Step 1: Creation */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Browser</span>
                      <span className="text-muted-foreground text-xs">generates key + encrypts message</span>
                    </div>
                    <span className="text-muted-foreground text-xs">plaintext → ciphertext</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Upload</span>
                      <span className="text-muted-foreground text-xs">(ciphertext only)</span>
                    </div>
                    <span className="text-muted-foreground text-xs">→ Server</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Storage */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Server</span>
                      <span className="text-muted-foreground text-xs">stores ciphertext + returns ID</span>
                    </div>
                    <span className="text-muted-foreground text-xs">ID: abc123</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Share */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-medium">Share link:</span>
                    <span className="text-muted-foreground text-xs break-all">
                      /otm/abc123<span className="text-foreground">#key=...</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5: Fetch */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Recipient</span>
                      <span className="text-muted-foreground text-xs">requests encrypted message</span>
                    </div>
                    <span className="text-muted-foreground text-xs">from Server</span>
                  </div>
                </div>
              </div>

              {/* Step 6: Delete */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  6
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Server</span>
                      <span className="text-muted-foreground text-xs">deletes message immediately</span>
                    </div>
                    <span className="text-red-500 text-xs">🔥 destroyed</span>
                  </div>
                </div>
              </div>

              {/* Step 7: Decrypt */}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  7
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Browser</span>
                      <span className="text-muted-foreground text-xs">decrypts using #key</span>
                    </div>
                    <span className="text-green-500 text-xs">✓ plaintext restored</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8">
            {/* E2E Encryption */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">End-to-End Encryption (AES-256-GCM)</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                Your message is encrypted in your browser using AES-256-GCM before it ever leaves your device. The
                server only receives encrypted ciphertext that is mathematically impossible to decrypt without the key.
              </p>
              <div className="bg-secondary/50 rounded-xl p-3 font-mono text-xs text-center ml-12">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-foreground">You</span>
                  <span className="text-muted-foreground">──(encrypted)──▶</span>
                  <span className="text-muted-foreground bg-secondary px-2 py-1 rounded">Server</span>
                  <span className="text-muted-foreground">──(encrypted)──▶</span>
                  <span className="text-foreground">Recipient</span>
                </div>
              </div>
            </div>

            {/* Per-Message Keys */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Key className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Per-Message Random Keys (256 bits)</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                Every message gets its own unique, random 256-bit encryption key generated in your browser. Keys are
                never reused across messages, ensuring perfect forward secrecy.
              </p>
            </div>

            {/* URL Fragment */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Hash className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">URL Fragment (#key=...) Never Sent to Server</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                The decryption key lives in the URL fragment after the{" "}
                <code className="bg-secondary px-1 py-0.5 rounded text-foreground">#</code>. Browsers never send
                anything after # to servers—this is a fundamental web standard since 1995.
              </p>
              <div className="bg-secondary/50 rounded-xl p-3 space-y-2 text-sm ml-12">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-foreground" />
                  <span className="text-muted-foreground text-xs">
                    Server sees: <code className="text-foreground">/otm/abc123</code>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <EyeOff className="w-4 h-4 text-muted-foreground/50" />
                  <span className="text-muted-foreground/70 text-xs">
                    Server does NOT see: <code>#key=...</code>
                  </span>
                </div>
              </div>
            </div>

            {/* Blind Storage */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Server className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Blind Storage: Server Sees Only Ciphertext</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                Our server stores only encrypted blobs—random bytes that are meaningless without the key. Even as the
                operator, we cannot read your messages. We have zero knowledge of message content.
              </p>
            </div>

            {/* Single-Read Enforcement */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Trash2 className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Single-Read Enforcement & Auto-Destruct</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                The moment someone opens your link, the encrypted blob is permanently deleted from the server. The
                message cannot be read again—ever. Messages also auto-expire after 7 days if never opened.
              </p>
            </div>
          </div>

          {/* OTM Flow Diagram */}
          {/* <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm md:text-base font-medium text-foreground text-center">Message Lifecycle</h3>
            <div className="flex flex-col gap-3.5 md:gap-4 text-sm md:text-sm font-mono">
              {/* Step 1: Creation */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Browser</span>
                      <span className="text-muted-foreground text-xs md:text-xs">generates key + encrypts</span>
                    </div>
                    <span className="text-muted-foreground text-xs md:text-xs">plaintext → ciphertext</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Upload</span>
                      <span className="text-muted-foreground text-xs md:text-xs">(ciphertext only)</span>
                    </div>
                    <span className="text-muted-foreground text-xs md:text-xs">→ Server</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Storage */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Server</span>
                      <span className="text-muted-foreground text-xs md:text-xs">stores blob + returns ID</span>
                    </div>
                    <span className="text-muted-foreground text-xs md:text-xs">ID: abc123</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Share */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <span className="text-foreground font-medium">Share link:</span>
                    <span className="text-muted-foreground text-xs md:text-xs break-all">
                      /otm/abc123<span className="text-foreground">#key=...</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5: Fetch */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Recipient</span>
                      <span className="text-muted-foreground text-xs md:text-xs">requests ciphertext</span>
                    </div>
                    <span className="text-muted-foreground text-xs md:text-xs">from Server</span>
                  </div>
                </div>
              </div>

              {/* Step 6: Delete */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  6
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Server</span>
                      <span className="text-muted-foreground text-xs md:text-xs">deletes blob immediately</span>
                    </div>
                    <span className="text-red-500 text-xs md:text-xs">🔥 destroyed</span>
                  </div>
                </div>
              </div>

              {/* Step 7: Decrypt */}
          {/* <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm md:text-sm font-bold shrink-0">
                  7
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Browser</span>
                      <span className="text-muted-foreground text-xs md:text-xs">decrypts using #key</span>
                    </div>
                    <span className="text-green-500 text-xs md:text-xs">✓ plaintext restored</span>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          <div className="space-y-4 pt-8 border-t border-border">
            <h3 className="text-xl font-medium text-foreground text-center">One-Time Messages FAQ</h3>
            <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto">
              Self-destructing encrypted messages — common questions about security and usage
            </p>
            <Accordion type="single" collapsible className="w-full" defaultValue="otm-faq-0">
              {OTM_FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`otm-faq-${index}`}>
                  <AccordionTrigger className="text-left text-foreground hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
