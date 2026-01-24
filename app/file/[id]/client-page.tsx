"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Download, FileIcon, ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { decryptBinaryFile, parseShareFragment } from "@/lib/file-crypto"
import { RateLimitModal } from "@/components/rate-limit-modal"
import { getApiBase } from "@/lib/api"
import type { EncryptedFile } from "@/lib/file-crypto"

type Status = "loading" | "loaded" | "used" | "missingKey" | "error" | "confirming"

export default function FileViewerClientPage() {
  const params = useParams()
  const id = params?.id as string
  const [status, setStatus] = useState<Status>("confirming")
  const [error, setError] = useState<string | null>(null)
  const [fragmentData, setFragmentData] = useState<{
    key: string | null
    iv: string | null
    mimeType: string | null
    fileName: string | null
  } | null>(null)
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showRateLimit, setShowRateLimit] = useState(false)
  const hasFetchedRef = useRef(false)
  const [fileSize, setFileSize] = useState<number | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    const parsed = parseShareFragment(hash)

    if (!parsed.key || !parsed.iv) {
      setStatus("missingKey")
      return
    }

    setFragmentData(parsed)
  }, [])

  const fetchAndDecrypt = async () => {
    if (!fragmentData?.key || !fragmentData?.iv) return
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    setStatus("loading")

    try {
      const response = await fetch(`${getApiBase()}/file/${id}`)

      if (response.status === 429) {
        setShowRateLimit(true)
        hasFetchedRef.current = false
        setStatus("confirming")
        return
      }

      if (response.status === 404) {
        setStatus("used")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch file")
      }

      const contentType = response.headers.get("Content-Type") || ""

      if (contentType.includes("application/octet-stream")) {
        const ciphertext = await response.arrayBuffer()
        setFileSize(ciphertext.byteLength)

        const blob = await decryptBinaryFile(
          ciphertext,
          fragmentData.key,
          fragmentData.iv,
          fragmentData.mimeType || "application/octet-stream",
        )
        setDecryptedBlob(blob)

        const mime = fragmentData.mimeType || ""
        if (mime.startsWith("image/") || mime === "application/pdf") {
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
        }
      } else {
        const data = await response.json()

        if (data.used) {
          setStatus("used")
          return
        }

        if (data.ciphertext) {
          const { decryptFile } = await import("@/lib/file-crypto")
          const encrypted = data.ciphertext as EncryptedFile
          setFileSize(encrypted.size)

          const blob = await decryptFile(encrypted, fragmentData.key)
          setDecryptedBlob(blob)

          if (encrypted.mimeType.startsWith("image/") || encrypted.mimeType === "application/pdf") {
            const url = URL.createObjectURL(blob)
            setPreviewUrl(url)
          }

          setFragmentData((prev) => ({
            ...prev!,
            mimeType: encrypted.mimeType,
            fileName: encrypted.name,
          }))
        }
      }

      setStatus("loaded")
    } catch (err) {
      console.error("Failed to fetch/decrypt file:", err)
      setError("Failed to load file. It may have been deleted or the link is invalid.")
      setStatus("error")
    }
  }

  const downloadFile = () => {
    if (!decryptedBlob || !fragmentData) return

    const url = URL.createObjectURL(decryptedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = fragmentData.fileName || "download"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (status === "missingKey") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Invalid one-time link</h1>
          <p className="text-muted-foreground">
            The decryption key is missing. This file cannot be opened from this URL.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/file">Create new file drop</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (status === "confirming") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-secondary/30 backdrop-blur-xl rounded-2xl p-8 space-y-6 border border-border shadow-lg">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
                <FileIcon className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">One-Time File Download</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This file can be downloaded exactly once. After viewing or downloading, the encrypted file will be{" "}
                <span className="text-foreground font-medium">permanently destroyed</span> from our servers.
              </p>
              <p className="text-xs text-muted-foreground">
                Once you proceed, the link becomes invalid forever. There is no way to recover the file.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={fetchAndDecrypt} size="lg" className="w-full rounded-full">
                I Understand
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full rounded-full">
                <Link href="/file">Go Back</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-foreground"></div>
          <p className="text-sm text-muted-foreground">Decrypting file...</p>
        </div>
      </div>
    )
  }

  if (status === "used") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {showRateLimit && <RateLimitModal onClose={() => setShowRateLimit(false)} />}
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">File Already Downloaded</h1>
          <p className="text-muted-foreground">This file was already downloaded or has expired.</p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline" className="rounded-full bg-transparent">
              <Link href="/file">Create Your Own</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Error Loading File</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild className="rounded-full">
            <Link href="/file">Create new file drop</Link>
          </Button>
        </div>
      </div>
    )
  }

  const mimeType = fragmentData?.mimeType || "application/octet-stream"
  const fileName = fragmentData?.fileName || "download"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-secondary/30 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">File Ready</h1>
            <p className="text-sm text-red-500 font-medium">Removed from server - save now, this is your only chance</p>
          </div>

          <div className="bg-background rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              {mimeType.startsWith("image/") ? (
                <ImageIcon className="w-12 h-12 text-muted-foreground shrink-0" />
              ) : mimeType === "application/pdf" ? (
                <FileText className="w-12 h-12 text-muted-foreground shrink-0" />
              ) : (
                <FileIcon className="w-12 h-12 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-base font-medium text-foreground truncate">{fileName}</p>
                {fileSize && <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>}
                <p className="text-xs text-muted-foreground">{mimeType}</p>
              </div>
            </div>

            {previewUrl && (
              <div className="rounded-lg overflow-hidden border border-border">
                {mimeType.startsWith("image/") ? (
                  <img src={previewUrl || "/placeholder.svg"} alt={fileName} className="w-full h-auto" />
                ) : mimeType === "application/pdf" ? (
                  <iframe src={previewUrl} className="w-full h-96" title="PDF Preview" />
                ) : null}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={downloadFile} size="lg" className="flex-1 rounded-full">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent">
              <Link href="/file">Create Your Own</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
