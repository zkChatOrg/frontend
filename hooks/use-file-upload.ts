"use client"

// Custom hook for handling file uploads to /api/upload
// Supports files from 1 KB to 20 MB with progress tracking

import { useState, useCallback } from "react"

export interface UploadResult {
  success: boolean
  file?: {
    name: string
    size: number
    sizeFormatted: string
    type: string
  }
  message?: string
  error?: string
}

export interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadResult>
  isUploading: boolean
  progress: number
  error: string | null
  result: UploadResult | null
  reset: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
    setResult(null)
  }, [])

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    // Reset state before starting
    setIsUploading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // Validate file size (max 20 MB)
      const maxSize = 20 * 1024 * 1024 // 20 MB in bytes
      if (file.size > maxSize) {
        const errorMsg = `File size exceeds 20 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`
        setError(errorMsg)
        setIsUploading(false)
        return { success: false, error: errorMsg }
      }

      // Validate file exists and has content
      if (file.size === 0) {
        const errorMsg = "File is empty"
        setError(errorMsg)
        setIsUploading(false)
        return { success: false, error: errorMsg }
      }

      console.log(`[Upload] Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)

      // Create FormData and append the file
      const formData = new FormData()
      formData.append("file", file)

      // Simulate initial progress
      setProgress(10)

      // Send the file to the upload API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // Note: Do NOT set Content-Type header - browser sets it automatically
        // with the correct multipart/form-data boundary
      })

      setProgress(90)

      // Parse the response
      const data: UploadResult = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || `Upload failed with status ${response.status}`
        console.error(`[Upload] Server error: ${errorMsg}`)
        setError(errorMsg)
        setIsUploading(false)
        setProgress(0)
        return { success: false, error: errorMsg }
      }

      // Success
      console.log("[Upload] Upload successful:", data)
      setProgress(100)
      setResult(data)
      setIsUploading(false)
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed"
      console.error("[Upload] Exception:", err)
      setError(errorMsg)
      setIsUploading(false)
      setProgress(0)
      return { success: false, error: errorMsg }
    }
  }, [])

  return {
    upload,
    isUploading,
    progress,
    error,
    result,
    reset,
  }
}
