"use client"

import type React from "react"
import {
  QrCode,
  RotateCcw,
  Lock,
  Upload,
  ShieldCheck,
  Eye,
  Timer,
  Copy,
  Check,
  FileIcon,
  Trash2,
  Clock,
} from "lucide-react"
import { useState, useRef, useEffect, type DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RateLimitModal } from "@/components/rate-limit-modal"
import { QrModal } from "@/components/qr-modal"
import { encryptFileForBinaryUpload, buildShareUrl } from "@/lib/file-crypto"
import { getApiBase } from "@/lib/api"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const FILE_FAQ_ITEMS = [
  {
    question: "What are common use cases for private file drops?",
    answer:
      "Share sensitive documents securely (contracts, tax forms, ID scans), send client credentials or API keys, deliver medical records or legal files, exchange cryptocurrency wallet backups, share screenshots with sensitive information, send one-time passwords or QR codes, deliver confidential reports, or share private photos that shouldn't persist.",
  },
  {
    question: "What is Private File Drop?",
    answer:
      "Private File Drop is a one-time, end-to-end encrypted file sharing system. Files are encrypted in your browser with AES-256-GCM before upload, stored temporarily on the server as raw encrypted binary, and automatically deleted after the first download or 24 hours—whichever comes first. The decryption key never touches our servers.",
  },
  {
    question: "Can zkChat see my file?",
    answer:
      "No. AES-256-GCM encryption happens entirely in your browser before upload. Only raw encrypted binary is sent to the server—no metadata, no filename, no file type. The decryption key, filename, and file type are stored in the URL fragment (#...), which browsers never send to servers. We receive only random encrypted bytes—mathematically impossible for us to read.",
  },
  {
    question: "How long do file drops live?",
    answer:
      "File drops expire after 24 hours or immediately after the first download, whichever happens first. This ensures temporary sharing without permanent storage or lingering traces.",
  },
  {
    question: "What file types can I send?",
    answer:
      "Any file type is supported—images, PDFs, documents, ZIP archives, videos, etc. The maximum file size is 10 MB to ensure fast encryption and reliable delivery while protecting server resources.",
  },
  {
    question: "What happens after someone downloads the file?",
    answer:
      "The encrypted blob is permanently deleted from our servers the instant it's downloaded. The link becomes invalid and cannot be used again. There is no recovery mechanism—the file is truly destroyed forever.",
  },
  {
    question: "Can I preview the file before downloading?",
    answer:
      "If the file is an image or PDF, the viewer will show a preview after decryption. For other file types, you'll see the filename and size with a direct download button. Previewing does not consume the download—only clicking 'Download File' destroys the link.",
  },
  {
    question: "Is there a history or log of uploaded files?",
    answer:
      "No. zkChat maintains zero logs of file content, names, or metadata beyond what's technically unavoidable (IP addresses in server logs, which we don't store long-term). We don't track who uploads or downloads files.",
  },
  {
    question: "Why raw binary instead of base64?",
    answer:
      "We upload encrypted files as raw binary (application/octet-stream) instead of base64-encoded JSON. This is ~33% more efficient (base64 inflates data by 1/3), faster (no encoding overhead), and more secure (server sees pure encrypted bytes with zero metadata).",
  },
]

export default function FileDropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRateLimit, setShowRateLimit] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Cleanup logic if needed
    return () => {
      // Cleanup code here
    }
  }, [])

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File too large (max 10 MB)`)
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      setUploadProgress(20)
      const encrypted = await encryptFileForBinaryUpload(file)
      setUploadProgress(60)

      const response = await fetch(`${getApiBase()}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: encrypted.ciphertext,
      })

      if (response.status === 429) {
        setShowRateLimit(true)
        return
      }

      if (!response.ok) throw new Error("Failed to upload file")

      const { id } = await response.json()
      setUploadProgress(100)

      const generatedLink = buildShareUrl(
        window.location.origin,
        id,
        encrypted.rawKey,
        encrypted.iv,
        encrypted.mimeType,
        encrypted.name,
      )
      setLink(generatedLink)
    } catch (err) {
      console.error("Failed to upload file:", err)
      setError("Failed to upload file. Please try again.")
    } finally {
      setLoading(false)
      setUploadProgress(0)
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
    setFile(null)
    setLink(null)
    setError(null)
    setShowQr(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showRateLimit && <RateLimitModal open={showRateLimit} onClose={() => setShowRateLimit(false)} />}
      {showQr && (
        <QrModal
          open={showQr}
          onClose={() => setShowQr(false)}
          value={link || ""}
          title="Scan on your phone"
          subtitle="Use this QR code to open the file on your phone or another device. It's like a private airdrop for your encrypted file."
        />
      )}

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Upload className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-5xl font-medium text-foreground tracking-tight text-balance">Private File Drop</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              One-time encrypted file sharing. Upload any file up to 10 MB—it self-destructs after one download or 24
              hours.
            </p>
          </div>

          {!link ? (
            <div className="pt-4 space-y-6">
              <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all ${
                      isDragging
                        ? "border-foreground bg-secondary/50"
                        : "border-border hover:border-foreground/50 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="space-y-4 text-center">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Drop a file or click to select</p>
                        <p className="text-xs text-muted-foreground">Maximum file size: 10 MB</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      className="hidden"
                      accept="*/*"
                    />
                  </div>
                ) : (
                  <div className="bg-background rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <FileIcon className="w-10 h-10 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-muted-foreground">{file.type || "Unknown type"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={reset}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-red-500 text-left">{error}</p>}
              </div>

              {file && (
                <>
                  {loading && (
                    <div className="space-y-2">
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress < 50 ? "Encrypting..." : "Uploading..."}
                      </p>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={uploadFile}
                    disabled={loading || !file}
                    className="w-full rounded-full h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    {loading ? "Encrypting & Uploading..." : "Upload File"}
                  </Button>
                </>
              )}

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  AES-256-GCM
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Download once
                </span>
                <span className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  Auto-expire (24h)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="bg-secondary rounded-2xl p-6 space-y-4">
                <p className="text-sm font-medium text-foreground">Your one-time file link is ready</p>
                <p className="text-xs text-muted-foreground">
                  This file is encrypted, stored for 24h, and self-destructs after the first download.
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
                Share this link securely. Once downloaded, the file is permanently destroyed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="border-t border-border bg-secondary/10 py-16">
        <div className="max-w-3xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">How Private File Drop Works</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Client-side encryption with one-time download enforcement
            </p>
          </div>

          {/* File Lifecycle Diagram */}
          <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm md:text-base font-medium text-foreground text-center">File Lifecycle</h3>
            <div className="flex flex-col gap-3.5 md:gap-4 text-sm font-mono">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Browser</span>
                      <span className="text-muted-foreground text-xs">generates key + encrypts file</span>
                    </div>
                    <span className="text-muted-foreground text-xs">plaintext → ciphertext blob</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Upload</span>
                      <span className="text-muted-foreground text-xs">(raw binary only)</span>
                    </div>
                    <span className="text-muted-foreground text-xs">→ Server</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Server</span>
                      <span className="text-muted-foreground text-xs">stores blob + returns ID</span>
                    </div>
                    <span className="text-muted-foreground text-xs">ID: xyz789</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-medium">Share link:</span>
                    <span className="text-muted-foreground text-xs break-all">
                      /f/xyz789<span className="text-foreground">#key:iv:mime:name</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Recipient</span>
                      <span className="text-muted-foreground text-xs">requests encrypted blob</span>
                    </div>
                    <span className="text-muted-foreground text-xs">from Server</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  6
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Server</span>
                      <span className="text-muted-foreground text-xs">deletes blob immediately</span>
                    </div>
                    <span className="text-red-500 text-xs">🔥 destroyed</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  7
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">Browser</span>
                      <span className="text-muted-foreground text-xs">decrypts using #key</span>
                    </div>
                    <span className="text-green-500 text-xs">plaintext restored</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Lock className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Client-Side Encryption</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                Your file is encrypted with AES-256-GCM in your browser before upload. The server receives only
                encrypted bytes—mathematically impossible to read without the key.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <ShieldCheck className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Key in URL Fragment</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                The decryption key lives in the URL fragment (#key=...). Browsers never send fragments to servers,
                making it impossible for us to decrypt your file.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Eye className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">One-Time Download</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                Files can be downloaded exactly once. After the first download, the encrypted blob is permanently
                deleted from our servers and the link becomes invalid forever.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Clock className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">24-Hour Expiration</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-12">
                Uploaded files automatically expire after 24 hours if not downloaded. This ensures temporary sharing
                without long-term storage or lingering traces.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4 pt-8 border-t border-border">
            <h3 className="text-xl font-medium text-foreground text-center">Private File Drop FAQ</h3>
            <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto">
              Self-destructing encrypted file sharing — common questions about security and usage
            </p>
            <Accordion type="single" collapsible className="w-full" defaultValue="file-faq-0">
              {FILE_FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`file-faq-${index}`}>
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
