"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle, XCircle, FileIcon, Loader2, RotateCcw } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"

export function UploadBox() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { upload, isUploading, progress, error, result, reset } = useFileUpload()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      reset()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    await upload(selectedFile)
  }

  const handleClear = () => {
    setSelectedFile(null)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept="*/*" />
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-secondary">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Click to select a file</p>
            <p className="text-xs text-muted-foreground mt-1">Max file size: 20 MB</p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              <FileIcon className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">Uploading... {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={isUploading} className="bg-transparent px-4">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {result?.success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-600">Upload Successful</p>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Name:</strong> {result.file?.name}
            </p>
            <p>
              <strong>Size:</strong> {result.file?.sizeFormatted}
            </p>
            <p>
              <strong>Type:</strong> {result.file?.type}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">Upload Failed</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{error}</p>
        </div>
      )}
    </div>
  )
}
