"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Lock,
  Send,
  LogOut,
  ShieldCheck,
  ShieldOff,
  Clock,
  Flame,
  X,
  Mic,
  Pause,
  Play,
  Trash2,
  ImageIcon,
  ZoomIn,
  Camera,
} from "lucide-react"
import { encryptMessage, decryptMessage, encryptAudioBytes, decryptAudioBytes } from "@/lib/crypto"
import { getWsUrl } from "@/lib/ws"
import { getColorForSenderId } from "@/lib/identity-colors"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { use } from "react"

interface Message {
  id: string
  text?: string
  timestamp: Date
  isMine: boolean
  senderId?: string
  systemEvent?: "join" | "leave" | "info"
  isSystem?: boolean
  type?: "text" | "audio" | "image"
  audioBlob?: Blob
  duration?: number
  imageBlob?: Blob
  imageMime?: string
  imageUrl?: string
}

interface ChatPayload {
  type: "chat"
  text: string
  senderId: string
  createdAt: number
}

interface AudioPayload {
  type: "audio"
  duration: number
  mime?: string  // Optional: iOS sends "audio/mp4", web sends "audio/webm"
  id: string
  senderId: string
  createdAt: number
}

interface ImagePayload {
  type: "image"
  mime: string
  size: number
  id: string
  senderId: string
  createdAt: number
}

interface SystemPayload {
  type: "system"
  event: "join" | "leave"
  senderId: string
  createdAt: number
}

type EncryptedPayload = ChatPayload | AudioPayload | ImagePayload | SystemPayload

interface FragmentParams {
  key: string
  createdAt: number
  ttl: number
}

type TeardownCase = "alone" | "all_left" | "others_online" | "expired" | "burned" | "left" | null

const MAX_RECORDING_DURATION_MS = 60000 // 60 seconds
const MAX_AUDIO_BYTES = 12 * 1024 * 1024 // 12MB limit

function parseFragmentParams(hash: string): FragmentParams | null {
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const key = params.get("key")
  const createdAt = params.get("createdAt")
  const ttl = params.get("ttl")

  if (!key) return null

  return {
    key,
    createdAt: createdAt ? Number.parseInt(createdAt, 10) : Date.now(),
    ttl: ttl ? Number.parseInt(ttl, 10) : 0,
  }
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00"
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000)) // Minimum 1 second display
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params)
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(1)
  const [configError, setConfigError] = useState<string | null>(null)
  const [teardownCase, setTeardownCase] = useState<"burned" | "expired" | "left" | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [hasWrongKey, setHasWrongKey] = useState(false)
  const [wrongKeyTimer, setWrongKeyTimer] = useState(15)

  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "review">("idle")
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null)
  const [recordedAudioMime, setRecordedAudioMime] = useState<string>("audio/mp4")
  const [recordedDuration, setRecordedDuration] = useState(0)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [isPlayingReview, setIsPlayingReview] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [reviewAudioProgress, setReviewAudioProgress] = useState(0)

  const [audioProgress, setAudioProgress] = useState<Map<string, number>>(new Map())

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  const [showImageSourceDialog, setShowImageSourceDialog] = useState(false)

  const [isInputDisabled, setIsInputDisabled] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const encryptionKeyRef = useRef<string | null>(null)
  const userCountRef = useRef(1)
  const mySenderIdRef = useRef<string | null>(null) // Corrected initialization
  const ttlRef = useRef<number>(0)
  const expiryTimeRef = useRef<number | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasAnnouncedJoinRef = useRef(false)
  const hasShownSecurityInfoRef = useRef(false)
  const recentSystemMessagesRef = useRef<Map<string, number>>(new Map())

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const recordingStartTimeRef = useRef<number>(0)

  const pendingAudioMetadataRef = useRef<Map<string, { duration: number; mime?: string; senderId: string; createdAt: number }>>(
    new Map(),
  )

  const pendingImageMetadataRef = useRef<
    Map<
      string,
      {
        mime: string
        size: number
        senderId: string
        createdAt: number
      }
    >
  >(new Map())

  const imageInputRef = useRef<HTMLInputElement>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  useEffect(() => {
    if (!hasWrongKey) return

    const interval = setInterval(() => {
      setWrongKeyTimer((prev) => {
        if (prev <= 1) {
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hasWrongKey, router])

  const addSecurityInfoMessage = useCallback(() => {
    if (!hasShownSecurityInfoRef.current) {
      hasShownSecurityInfoRef.current = true
      const message: Message = {
        id: `info-${Date.now()}`,
        text: "This is an end-to-end encrypted chat. No one outside this room can read your messages.",
        timestamp: new Date(),
        isMine: false,
        isSystem: true,
        systemEvent: "info",
      }
      setMessages((prev) => [...prev, message])
    }
  }, [])

  const isDuplicateSystemMessage = useCallback((senderId: string, event: "join" | "leave") => {
    const now = Date.now()
    const lastSeen = recentSystemMessagesRef.current.get(`${senderId}-${event}`) || 0
    const isRecent = now - lastSeen < 5000 // Consider messages within 5 seconds as duplicates

    if (isRecent) {
      return true
    }

    recentSystemMessagesRef.current.set(`${senderId}-${event}`, now)
    return false
  }, [])

  const sendSystemMessage = useCallback(async (event: "join" | "leave") => {
    const key = encryptionKeyRef.current
    const ws = wsRef.current

    if (!ws || ws.readyState !== WebSocket.OPEN || !key || !mySenderIdRef.current) return

    try {
      const payload: SystemPayload = {
        type: "system",
        event,
        senderId: mySenderIdRef.current,
        createdAt: Date.now(),
      }
      const payloadJson = JSON.stringify(payload)
      const { iv, ciphertext } = await encryptMessage(payloadJson, key)

      const envelope = JSON.stringify({
        type: "message",
        iv,
        ciphertext,
      })
      ws.send(envelope)
    } catch (error) {
      console.error(`Failed to send ${event} message:`, error)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User returned to tab - check if we should re-enable input
        const ws = wsRef.current
        const isRoomValid = !isExpired && !teardownCase && !hasWrongKey // Also check for wrong key
        if (ws && ws.readyState === WebSocket.OPEN && isRoomValid) {
          // Connection is still open and room is valid - ensure input is enabled
          setIsInputDisabled(false)
        } else if (ws && ws.readyState === WebSocket.CLOSED && isRoomValid) {
          // Connection closed but room is still valid - could attempt reconnect here
          // For now, just keep input disabled - user can refresh
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isExpired, teardownCase, hasWrongKey]) // Added hasWrongKey dependency

  useEffect(() => {
    if (!roomId) {
      setConfigError("Invalid room: roomId is missing from the URL")
      return
    }

    const hash = window.location.hash.substring(1)
    const fragmentParams = parseFragmentParams(hash)

    if (!fragmentParams) {
      alert("Invalid room link. Missing encryption key.")
      router.push("/")
      return
    }

    encryptionKeyRef.current = fragmentParams.key
    ttlRef.current = fragmentParams.ttl

    if (fragmentParams.ttl > 0) {
      const expiryTime = fragmentParams.createdAt + fragmentParams.ttl
      expiryTimeRef.current = expiryTime
      const now = Date.now()

      if (now > expiryTime) {
        setIsExpired(true)
        setTeardownCase("expired")
        return
      }

      setTimeRemaining(expiryTime - now)
      countdownIntervalRef.current = setInterval(() => {
        const remaining = expiryTimeRef.current! - Date.now()
        if (remaining <= 0) {
          setTimeRemaining(0)
          setIsExpired(true)
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
          }
          if (wsRef.current) {
            wsRef.current.close()
          }
          setMessages([])
          setTeardownCase("expired")
        } else {
          setTimeRemaining(remaining)
        }
      }, 1000)
    }

    let wsUrl: string
    try {
      wsUrl = getWsUrl(roomId)
    } catch (error) {
      setConfigError((error as Error).message)
      return
    }

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.binaryType = "arraybuffer"

    ws.onopen = async () => {
      setIsConnected(true)
      addSecurityInfoMessage()

      // Assign a sender ID on connection if not already assigned
      if (!mySenderIdRef.current) {
        mySenderIdRef.current = crypto.randomUUID()
      }

      if (!hasAnnouncedJoinRef.current) {
        hasAnnouncedJoinRef.current = true
        setTimeout(async () => {
          await sendSystemMessage("join")
        }, 100)
      }
    }

    ws.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        const key = encryptionKeyRef.current
        if (!key) return

        try {
          const encryptedBytes = new Uint8Array(event.data)
          const decryptedBytes = await decryptAudioBytes(encryptedBytes, key)

          if (!decryptedBytes) {
            setHasWrongKey(true)
            if (wsRef.current) {
              wsRef.current.close()
            }
            return
          }

          // First 16 bytes are the message ID (UUID)
          const idBytes = decryptedBytes.slice(0, 16)
          const contentBytes = decryptedBytes.slice(16)

          // Convert UUID bytes back to string
          const idHex = Array.from(idBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
          const messageId = [
            idHex.slice(0, 8),
            idHex.slice(8, 12),
            idHex.slice(12, 16),
            idHex.slice(16, 20),
            idHex.slice(20, 32),
          ].join("-")


          const audioMetadata = pendingAudioMetadataRef.current.get(messageId)
          const imageMetadata = pendingImageMetadataRef.current.get(messageId)

          if (audioMetadata) {
            pendingAudioMetadataRef.current.delete(messageId)

            // Use mime type from metadata (iOS sends "audio/mp4"), fallback to webm for web recordings
            const audioMimeType = audioMetadata.mime || "audio/webm"
            const audioBlob = new Blob([contentBytes], { type: audioMimeType })

            const newMessage: Message = {
              id: messageId,
              timestamp: new Date(audioMetadata.createdAt),
              isMine: audioMetadata.senderId === mySenderIdRef.current,
              senderId: audioMetadata.senderId,
              type: "audio",
              audioBlob,
              duration: audioMetadata.duration,
            }

            setMessages((prev) => [...prev, newMessage])
          } else if (imageMetadata) {
            pendingImageMetadataRef.current.delete(messageId)

            const imageBlob = new Blob([contentBytes], { type: imageMetadata.mime })
            const imageUrl = URL.createObjectURL(imageBlob)

            const newMessage: Message = {
              id: messageId,
              timestamp: new Date(imageMetadata.createdAt),
              isMine: imageMetadata.senderId === mySenderIdRef.current,
              senderId: imageMetadata.senderId,
              type: "image",
              imageBlob,
              imageMime: imageMetadata.mime,
              imageUrl,
            }

            setMessages((prev) => [...prev, newMessage])
          } else {
            console.error("No metadata found for binary message:", messageId)
          }
        } catch (error) {
          console.error("Error processing binary payload:", error)
        }
        return
      }

      // Handle text frames (JSON)
      try {
        const data = JSON.parse(event.data)

        if (data.type === "roomDestroyed") {
          setMessages([])
          if (wsRef.current) {
            wsRef.current.close()
          }
          setTeardownCase("burned")
          return
        }

        if (data.type === "connected") {
          setUserCount(data.clientCount)
          userCountRef.current = data.clientCount
        } else if (data.type === "presence") {
          setUserCount(data.count)
          userCountRef.current = data.count
        } else if (data.type === "user_joined") {
          const prevCount = userCountRef.current
          const newCount = prevCount + 1
          setUserCount(newCount)
          userCountRef.current = newCount
        } else if (data.type === "user_left") {
          const prevCount = userCountRef.current
          const newCount = Math.max(1, prevCount - 1)
          setUserCount(newCount)
          userCountRef.current = newCount
        } else if (data.type === "message" && data.iv && data.ciphertext) {
          const key = encryptionKeyRef.current
          if (!key) return

          try {
            const decrypted = await decryptMessage(data.iv, data.ciphertext, key)
            const payload: EncryptedPayload = JSON.parse(decrypted)

            if (payload.type === "system") {
              const systemPayload = payload as SystemPayload

              if (systemPayload.senderId === mySenderIdRef.current) {
                return
              }

              if (isDuplicateSystemMessage(systemPayload.senderId, systemPayload.event)) {
                return
              }

              const systemMessage: Message = {
                id: `system-${systemPayload.event}-${systemPayload.senderId}-${systemPayload.createdAt}`,
                text: systemPayload.event === "join" ? "joined the chat" : "left the chat",
                timestamp: new Date(systemPayload.createdAt),
                isMine: false,
                senderId: systemPayload.senderId,
                isSystem: true,
                systemEvent: systemPayload.event,
              }

              setMessages((prev) => [...prev, systemMessage])
            } else if (payload.type === "audio") {
              const audioPayload = payload as AudioPayload

              pendingAudioMetadataRef.current.set(audioPayload.id, {
                duration: audioPayload.duration,
                mime: audioPayload.mime,  // iOS sends "audio/mp4", web sends undefined (defaults to webm)
                senderId: audioPayload.senderId,
                createdAt: audioPayload.createdAt,
              })
            } else if (payload.type === "image") {
              const imagePayload = payload as ImagePayload

              pendingImageMetadataRef.current.set(imagePayload.id, {
                mime: imagePayload.mime,
                size: imagePayload.size,
                senderId: imagePayload.senderId,
                createdAt: imagePayload.createdAt,
              })
            } else {
              const chatPayload = payload as ChatPayload

              const newMessage: Message = {
                id: `${chatPayload.senderId}-${chatPayload.createdAt}`,
                text: chatPayload.text,
                timestamp: new Date(chatPayload.createdAt),
                isMine: chatPayload.senderId === mySenderIdRef.current,
                senderId: chatPayload.senderId,
                type: "text",
              }

              setMessages((prev) => [...prev, newMessage])
            }
          } catch (error) {
            console.error("Failed to decrypt message:", error)
            setHasWrongKey(true)
            if (wsRef.current) {
              wsRef.current.close()
            }
          }
        }
      } catch (error) {
        console.error("Error processing message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsConnected(false)
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    const handleBeforeUnload = () => {
      try {
        const key = encryptionKeyRef.current
        if (key && ws.readyState === WebSocket.OPEN) {
          sendSystemMessage("leave")
        }
      } catch {
        // Ignore errors during unload
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (reviewAudioRef.current) {
        reviewAudioRef.current.pause()
        if (reviewAudioRef.current.src) {
          URL.revokeObjectURL(reviewAudioRef.current.src)
        }
      }
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
      audioElementsRef.current.forEach((audio) => {
        audio.pause()
        if (audio.src) {
          URL.revokeObjectURL(audio.src)
        }
      })
      audioElementsRef.current.clear()
      // Clean up object URLs for sent images
      messages.forEach((msg) => {
        if (msg.type === "image" && msg.imageUrl) {
          URL.revokeObjectURL(msg.imageUrl)
        }
      })
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl)
      }
    }
  }, [roomId, router, addSecurityInfoMessage, isDuplicateSystemMessage, sendSystemMessage])

  // This useEffect is now redundant as cleanup is handled in the main useEffect return function
  // useEffect(() => {
  //   return () => {
  //     messages.forEach((msg) => {
  //       if (msg.imageUrl) {
  //         URL.revokeObjectURL(msg.imageUrl)
  //       }
  //     })
  //     if (selectedImagePreviewUrl) {
  //       URL.revokeObjectURL(selectedImagePreviewUrl)
  //     }
  //   }
  // }, [messages, selectedImagePreviewUrl])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const key = encryptionKeyRef.current
    const ws = wsRef.current

    if (!inputValue.trim() || !ws || ws.readyState !== WebSocket.OPEN || !key || !mySenderIdRef.current) return

    try {
      const payload: ChatPayload = {
        type: "chat",
        senderId: mySenderIdRef.current,
        text: inputValue.trim(),
        createdAt: Date.now(),
      }
      const payloadJson = JSON.stringify(payload)
      const { iv, ciphertext } = await encryptMessage(payloadJson, key)

      const envelope = JSON.stringify({
        type: "message",
        iv,
        ciphertext,
      })
      ws.send(envelope)

      const newMessage: Message = {
        id: `${mySenderIdRef.current}-${payload.createdAt}`,
        text: inputValue.trim(),
        timestamp: new Date(),
        isMine: true,
        senderId: mySenderIdRef.current,
        type: "text",
      }
      setMessages((prev) => [...prev, newMessage])
      setInputValue("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }, [inputValue])

  const prepareImageForSending = useCallback(async (file: File): Promise<{ blob: Blob; mime: string } | null> => {
    try {
      return await new Promise((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            if (!ctx) {
              reject(new Error("Could not get canvas context"))
              return
            }

            // Calculate dimensions (max 1600px on longest side)
            const maxDimension = 1600
            let width = img.width
            let height = img.height

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension
                width = maxDimension
              } else {
                width = (width / height) * maxDimension
                height = maxDimension
              }
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(img.src)
                if (blob) {
                  resolve({ blob, mime: "image/jpeg" })
                } else {
                  reject(new Error("Failed to create blob from canvas"))
                }
              },
              "image/jpeg",
              0.8,
            )
          } catch (error) {
            URL.revokeObjectURL(img.src)
            reject(error)
          }
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          reject(new Error("Failed to load image"))
        }
        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error("Image preprocessing failed:", error)
      return null
    }
  }, [])

  const handleImageFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, source?: "camera" | "gallery") => {
      const file = e.target.files?.[0]

      // Close dialog now that file has been selected (or user cancelled)
      setShowImageSourceDialog(false)

      if (!file) return

      // Reset input value so same file can be selected again
      e.target.value = ""

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.")
        return
      }

      // Validate file size (8 MB limit)
      const MAX_RAW_SIZE = 8 * 1024 * 1024
      if (file.size > MAX_RAW_SIZE) {
        alert("Image is too large. Please select an image smaller than 8 MB.")
        return
      }

      // Show preview
      const previewUrl = URL.createObjectURL(file)
      setSelectedImageFile(file)
      setSelectedImagePreviewUrl(previewUrl)
    },
    [],
  )

  const cancelImageSelection = useCallback(() => {
    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl)
    }
    setSelectedImageFile(null)
    setSelectedImagePreviewUrl(null)
  }, [selectedImagePreviewUrl])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Prefer MP4/AAC for cross-platform compatibility (iOS + Web)
      // Safari supports mp4, Chrome/Firefox support webm
      let mimeType = "audio/mp4"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm;codecs=opus"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/webm"
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.onstart = () => {
        audioChunksRef.current = []
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {

        // Clear timers
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }
        if (autoStopTimeoutRef.current) {
          clearTimeout(autoStopTimeoutRef.current)
          autoStopTimeoutRef.current = null
        }

        // Calculate actual duration
        const durationMs = Date.now() - recordingStartTimeRef.current

        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        // Check if we have chunks
        if (audioChunksRef.current.length === 0) {
          alert("No audio recorded. Please try again.")
          setRecordingState("idle")
          setRecordingDuration(0)
          return
        }

        // Create blob
        const blob = new Blob(audioChunksRef.current, { type: mimeType })

        if (blob.size > MAX_AUDIO_BYTES - 128) {
          alert("Voice message is too large. Please record a shorter note.")
          setRecordingState("idle")
          setRecordingDuration(0)
          return
        }

        setRecordedAudioBlob(blob)
        setRecordedAudioMime(mimeType)  // Store the actual mime type used
        setRecordedDuration(Math.max(durationMs, 1000)) // Ensure at least 1 second
        setRecordingState("review")
      }

      mediaRecorder.start(1000) // Collect data every second
      recordingStartTimeRef.current = Date.now()
      setRecordingState("recording")
      setRecordingDuration(0)

      recordingTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTimeRef.current
        setRecordingDuration(elapsed)
      }, 100)

      autoStopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop()
        }
      }, MAX_RECORDING_DURATION_MS)
    } catch (error) {
      console.error("Failed to start recording:", error)
      alert("Failed to access microphone. Please check permissions.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
    }
  }, [])

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current

    if (mediaRecorder && mediaRecorder.state === "recording") {
      // Remove onstop temporarily to prevent preview state
      mediaRecorder.onstop = null
      mediaRecorder.stop()
    }

    // Clear all timers
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current)
      autoStopTimeoutRef.current = null
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Clear data
    audioChunksRef.current = []
    setRecordingState("idle")
    setRecordingDuration(0)
  }, [])

  const deleteRecording = useCallback(() => {
    if (reviewAudioRef.current) {
      reviewAudioRef.current.pause()
      if (reviewAudioRef.current.src) {
        URL.revokeObjectURL(reviewAudioRef.current.src)
      }
      reviewAudioRef.current = null
    }

    audioChunksRef.current = []
    setRecordedAudioBlob(null)
    setRecordedDuration(0)
    setIsPlayingReview(false)
    setReviewAudioProgress(0)
    setRecordingState("idle")
  }, [])

  const toggleReviewPlayback = useCallback(() => {
    if (!recordedAudioBlob) return

    if (!reviewAudioRef.current) {
      const url = URL.createObjectURL(recordedAudioBlob)
      const audio = new Audio(url)
      reviewAudioRef.current = audio

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setReviewAudioProgress((audio.currentTime / audio.duration) * 100)
        }
      }
      audio.onended = () => {
        setIsPlayingReview(false)
        setReviewAudioProgress(0)
        audio.currentTime = 0
      }
      audio.onpause = () => setIsPlayingReview(false)
      audio.onplay = () => setIsPlayingReview(true)
    }

    if (reviewAudioRef.current.paused) {
      if (reviewAudioRef.current.ended) {
        reviewAudioRef.current.currentTime = 0
        setReviewAudioProgress(0)
      }
      reviewAudioRef.current.play()
    } else {
      reviewAudioRef.current.pause()
    }
  }, [recordedAudioBlob, reviewAudioProgress])

  const sendImageMessage = useCallback(async () => {
    const key = encryptionKeyRef.current
    const ws = wsRef.current
    const imageFile = selectedImageFile

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("Connection lost. Please refresh the page.")
      return
    }

    if (!key) {
      alert("Encryption key missing. Please refresh the page.")
      return
    }

    if (!imageFile) {
      alert("No image selected.")
      return
    }

    setIsProcessingImage(true)

    try {
      // Preprocess image
      const prepared = await prepareImageForSending(imageFile)
      if (!prepared) {
        alert("Failed to process image. Please try another image.")
        setIsProcessingImage(false)
        return
      }

      const { blob: processedBlob, mime } = prepared

      // Check final size (12 MB limit to match audio)
      const MAX_SIZE = 12 * 1024 * 1024
      if (processedBlob.size > MAX_SIZE) {
        alert("Processed image is too large. Please try a smaller image.")
        setIsProcessingImage(false)
        return
      }

      // Generate message ID
      const messageId = crypto.randomUUID()

      // Step 1: Send image metadata as encrypted JSON
      const imagePayload: ImagePayload = {
        type: "image",
        mime,
        size: processedBlob.size,
        id: messageId,
        senderId: mySenderIdRef.current!, // Use non-null assertion
        createdAt: Date.now(),
      }

      const payloadJson = JSON.stringify(imagePayload)
      const { iv, ciphertext } = await encryptMessage(payloadJson, key)

      const envelope = JSON.stringify({
        type: "message",
        iv,
        ciphertext,
      })

      ws.send(envelope)

      // Step 2: Prepare image bytes with ID prefix (same pattern as audio)
      const imageArrayBuffer = await processedBlob.arrayBuffer()
      const imageBytes = new Uint8Array(imageArrayBuffer)

      // Convert message ID to bytes (16 bytes from hex)
      const idHex = messageId.replace(/-/g, "")
      const idBytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        idBytes[i] = Number.parseInt(idHex.substr(i * 2, 2), 16)
      }

      // Combine ID + image bytes
      const combined = new Uint8Array(16 + imageBytes.length)
      combined.set(idBytes, 0)
      combined.set(imageBytes, 16)

      // Step 3: Encrypt the combined payload
      const encryptedImageBytes = await encryptAudioBytes(combined, key)

      // Step 4: Send as binary WebSocket frame
      ws.send(encryptedImageBytes.buffer)

      // Add to local messages
      const imageUrl = URL.createObjectURL(processedBlob)
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date(),
        isMine: true,
        senderId: mySenderIdRef.current!, // Use non-null assertion
        type: "image",
        imageBlob: processedBlob,
        imageMime: mime,
        imageUrl,
      }

      setMessages((prev) => [...prev, newMessage])

      // Clear preview
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl)
      }
      setSelectedImageFile(null)
      setSelectedImagePreviewUrl(null)
      setIsProcessingImage(false)
    } catch (error) {
      console.error("Failed to send image:", error)
      alert("Failed to send image. Please try again.")
      setIsProcessingImage(false)
    }
  }, [selectedImageFile, selectedImagePreviewUrl, prepareImageForSending])

  const sendAudioMessage = useCallback(async () => {
    const key = encryptionKeyRef.current
    const ws = wsRef.current
    const audioBlob = recordedAudioBlob
    const durationMs = recordedDuration

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("Connection lost. Please refresh the page.")
      return
    }

    if (!key) {
      alert("Encryption key missing. Please refresh the page.")
      return
    }

    if (!audioBlob) {
      alert("No audio recorded. Please try again.")
      return
    }

    try {
      // Generate message ID
      const messageId = crypto.randomUUID()

      // Step 1: Send audio metadata as encrypted JSON
      // Use actual recorded mime type (mp4 on Safari, webm on Chrome/Firefox)
      const audioPayload: AudioPayload = {
        type: "audio",
        duration: durationMs,
        mime: recordedAudioMime,  // Actual format used (mp4 or webm)
        id: messageId,
        senderId: mySenderIdRef.current!, // Use non-null assertion
        createdAt: Date.now(),
      }

      const payloadJson = JSON.stringify(audioPayload)
      const { iv, ciphertext } = await encryptMessage(payloadJson, key)

      const envelope = JSON.stringify({
        type: "message",
        iv,
        ciphertext,
      })

      ws.send(envelope)

      // Step 2: Prepare audio bytes with ID prefix
      const audioArrayBuffer = await audioBlob.arrayBuffer()
      const audioBytes = new Uint8Array(audioArrayBuffer)

      // Convert message ID to bytes (16 bytes from hex representation)
      const idHex = messageId.replace(/-/g, "")
      const idBytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        idBytes[i] = Number.parseInt(idHex.substr(i * 2, 2), 16)
      }

      // Combine ID + audio bytes
      const combined = new Uint8Array(16 + audioBytes.length)
      combined.set(idBytes, 0)
      combined.set(audioBytes, 16)

      // Step 3: Encrypt the combined payload
      const encryptedAudioBytes = await encryptAudioBytes(combined, key)

      if (encryptedAudioBytes.length > MAX_AUDIO_BYTES) {
        alert("Voice message is too large to send (max 12MB after encryption).")
        return
      }

      // Step 4: Send as binary WebSocket frame
      ws.send(encryptedAudioBytes.buffer)

      // Step 5: Add to local messages immediately
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date(),
        isMine: true,
        senderId: mySenderIdRef.current!, // Use non-null assertion
        type: "audio",
        audioBlob: audioBlob,
        duration: durationMs,
      }

      setMessages((prev) => [...prev, newMessage])

      // Clean up
      deleteRecording()
    } catch (error) {
      console.error("Failed to send audio message:", error)
      alert("Failed to send voice message. Please try again.")
    }
  }, [recordedAudioBlob, recordedAudioMime, recordedDuration, deleteRecording])

  const toggleAudioPlayback = useCallback((messageId: string, audioBlob: Blob) => {
    // Pause any currently playing audio
    audioElementsRef.current.forEach((audio, id) => {
      if (id !== messageId) {
        audio.pause()
      }
    })

    const currentAudio = audioElementsRef.current.get(messageId)

    if (currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play()
        setPlayingAudioId(messageId)
      } else {
        currentAudio.pause()
        setPlayingAudioId(null)
      }
    } else {
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)

      audio.ontimeupdate = () => {
        if (audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100
          setAudioProgress((prev) => new Map(prev).set(messageId, progress))
        }
      }

      audio.onended = () => {
        setPlayingAudioId(null)
        setAudioProgress((prev) => {
          const next = new Map(prev)
          next.set(messageId, 0)
          return next
        })
      }

      audio.onpause = () => {
        setPlayingAudioId(null)
      }

      audioElementsRef.current.set(messageId, audio)
      audio.play()
      setPlayingAudioId(messageId)
    }
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleLeave = async () => {
    await sendSystemMessage("leave")

    if (wsRef.current) {
      wsRef.current.close()
    }

    setMessages([])
    setTeardownCase("left")
  }

  const handleBurnRoom = async () => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    ws.send(
      JSON.stringify({
        type: "control",
        action: "burnRoom",
        roomId: roomId,
      }),
    )

    setMessages([])
    if (wsRef.current) {
      wsRef.current.close()
    }
    setTeardownCase("burned")
  }

  const openImageSourceDialog = () => {
    setShowImageSourceDialog(true)
  }

  const selectImageSource = (source: "camera" | "gallery") => {
    if (source === "camera") {
      // Camera: close dialog immediately and open camera
      setShowImageSourceDialog(false)
      if (imageInputRef.current) {
        imageInputRef.current.setAttribute("capture", "environment")
        imageInputRef.current.click()
      }
    } else {
      // Gallery: keep dialog open, let handleImageFileSelect close it after selection
      if (imageInputRef.current) {
        imageInputRef.current.removeAttribute("capture")
        imageInputRef.current.click()
      }
    }
  }

  if (hasWrongKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-4">
              <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Wrong Encryption Key</h1>
            <p className="text-center text-gray-600">
              You're trying to join this room with an incorrect encryption key. Messages cannot be decrypted.
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-sm text-red-800">
              Auto-redirecting to home in <span className="font-bold text-red-600">{wrongKeyTimer}</span> seconds
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-orange-700 hover:shadow-xl"
          >
            Leave & Go Home
          </button>
        </div>
      </div>
    )
  }

  if (teardownCase === "burned") {
    const icon = <Flame className="h-16 w-16 text-red-500" />
    const title = "Room Destroyed"
    const description = "This room was permanently destroyed. The link can no longer be used to start a new session."

    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center text-center max-w-md">
            {icon}
            <h1 className="text-2xl font-semibold mt-6 mb-2 text-foreground">{title}</h1>
            <p className="text-muted-foreground mb-8">{description}</p>
            <Link href="/">
              <Button className="rounded-full px-8">Create New Room</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (teardownCase) {
    let icon = <ShieldCheck className="h-16 w-16 text-green-500" />
    let title = "Session Ended"
    let description = "Your secure session has ended. All local data has been cleared."

    if (teardownCase === "left") {
      icon = <ShieldOff className="h-16 w-16 text-muted-foreground" />
      title = "You Left the Room"
      description = "Your local session has been cleared. Other participants may still be online."
    } else if (teardownCase === "alone") {
      icon = <ShieldCheck className="h-16 w-16 text-green-500" />
      title = "Room Destroyed"
      description = "You were the only participant. The room has been permanently destroyed and all traces removed."
    } else if (teardownCase === "all_left") {
      icon = <ShieldOff className="h-16 w-16 text-amber-500" />
      title = "Session Ended"
      description =
        "All other participants have left. Your local session is cleared, but the room may still exist if others rejoin."
    } else if (teardownCase === "others_online") {
      icon = <ShieldOff className="h-16 w-16 text-amber-500" />
      title = "You Left the Room"
      description =
        "Other participants are still online. Your local session is cleared, but the conversation continues without you."
    } else if (teardownCase === "expired") {
      icon = <Clock className="h-16 w-16 text-red-500" />
      title = "This Room Has Expired"
      description =
        "This ephemeral room self-destructed after its timer ran out. Start a new secure session to continue chatting."
    }

    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center text-center max-w-md">
            {icon}
            <h1 className="text-2xl font-semibold mt-6 mb-2 text-foreground">{title}</h1>
            <p className="text-muted-foreground mb-8">{description}</p>
            <Link href="/">
              <Button className="rounded-full px-8">Create New Room</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <X className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2 text-foreground">Configuration Required</h1>
            <p className="text-muted-foreground mb-4">{configError}</p>
            <div className="bg-muted p-4 rounded-lg text-left text-sm font-mono mb-4">
              <p className="text-muted-foreground mb-2"># Add to your environment:</p>
              <p className="text-foreground">NEXT_PUBLIC_WS_URL=wss://your-relay.example.com</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="rounded-full bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">zkChat</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>
                E2E Active · {userCount} {userCount === 1 ? "user" : "users"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeRemaining !== null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{formatCountdown(timeRemaining)}</span>
              </div>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Burn room"
                >
                  <Flame className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Burn this room?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently destroy the room for all participants. All local message history will be
                    cleared and no one will be able to rejoin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBurnRoom}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Burn Room
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-1.5">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => {
          if (message.isSystem) {
            const senderColor = message.senderId ? getColorForSenderId(message.senderId) : undefined

            if (message.systemEvent === "info") {
              return (
                <div key={message.id} className="flex justify-center">
                  <p
                    className="text-xs text-center max-w-xs text-muted-foreground/70"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {message.text}
                  </p>
                </div>
              )
            }

            return (
              <div key={message.id} className="flex justify-center items-center gap-1.5">
                {senderColor && (
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: senderColor }} />
                )}
                <p className="text-xs text-muted-foreground/60">{message.text}</p>
              </div>
            )
          }

          if (message.type === "image" && message.imageUrl) {
            const senderColor = message.senderId ? getColorForSenderId(message.senderId) : ""
            return (
              <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col max-w-[70%]">
                  <div
                    className={`rounded-2xl p-2 overflow-hidden ${message.isMine ? "bg-primary" : ""}`}
                    style={!message.isMine && senderColor ? { backgroundColor: senderColor } : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxImage(message.imageUrl!)}
                      className="relative group block overflow-hidden rounded-lg"
                    >
                      <img
                        src={message.imageUrl || "/placeholder.svg"}
                        alt="Shared image"
                        className="w-full h-auto rounded-lg object-contain"
                        style={{ maxHeight: "300px" }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </button>
                  </div>
                  <div className={`text-xs opacity-70 mt-1 px-1 ${message.isMine ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            )
          }

          if (message.type === "audio" && message.audioBlob) {
            const senderColor = message.senderId ? getColorForSenderId(message.senderId) : ""
            const isMine = message.isMine
            const isPlaying = playingAudioId === message.id
            const progress = audioProgress.get(message.id) || 0

            const audio = audioElementsRef.current.get(message.id)
            const currentTime = audio ? Math.floor(audio.currentTime) : 0
            const totalDuration = message.duration || 0
            const totalTimeDisplay = formatCountdown(totalDuration)
            const currentTimeDisplay = formatCountdown(currentTime * 1000)

            return (
              <div key={message.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground" : "text-white"}`}
                  style={!isMine && senderColor ? { backgroundColor: senderColor } : undefined}
                >
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-white/20 shrink-0"
                      onClick={() => toggleAudioPlayback(message.id, message.audioBlob!)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-0.5 items-end h-4 mb-1">
                        {[...Array(20)].map((_, i) => {
                          const barProgress = (i / 20) * 100
                          const isActive = progress > barProgress

                          return (
                            <div
                              key={i}
                              className={`w-0.5 rounded-full transition-all duration-75 ${
                                isPlaying ? "animate-pulse" : ""
                              }`}
                              style={{
                                height: `${12 + Math.sin(i * 0.5) * 4}px`,
                                backgroundColor: "currentColor",
                                opacity: isActive ? 1 : 0.4,
                                animationDelay: isPlaying ? `${i * 50}ms` : "0ms",
                                animationDuration: isPlaying ? "1s" : "0s",
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                    <span className="text-xs opacity-80 shrink-0 tabular-nums whitespace-nowrap">
                      {currentTimeDisplay}/{totalTimeDisplay || "0:01"}
                    </span>
                  </div>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 px-1 ${isMine ? "text-right" : "text-left"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            )
          }

          const senderColor = message.senderId ? getColorForSenderId(message.senderId) : ""
          const isMine = message.isMine

          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col max-w-[70%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground" : "text-white"}`}
                  style={!isMine && senderColor ? { backgroundColor: senderColor } : undefined}
                >
                  <p className="text-sm leading-relaxed break-words">{message.text}</p>
                </div>
                <div className={`text-xs opacity-70 mt-1 px-1 ${isMine ? "text-right" : "text-left"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Voice Recording UI */}
      {recordingState === "recording" && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-muted/50 sticky bottom-0 z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording {formatCountdown(recordingDuration)}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelRecording}
                className="text-muted-foreground hover:text-foreground hover:bg-muted touch-action-manipulation min-h-[44px] min-w-[70px]"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={stopRecording} className="touch-action-manipulation min-h-[44px] min-w-[60px]">
                Stop
              </Button>
            </div>
            <Progress value={(recordingDuration / MAX_RECORDING_DURATION_MS) * 100} className="h-1.5" />
          </div>
        </div>
      )}

      {recordingState === "review" && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-muted/50 sticky bottom-0 z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full touch-action-manipulation min-h-[44px] min-w-[44px]"
                onClick={toggleReviewPlayback}
              >
                {isPlayingReview ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex gap-1 items-end h-6">
                  {[...Array(30)].map((_, i) => {
                    const barProgress = (i / 29) * 100
                    const isPlayed = reviewAudioProgress > barProgress
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-full transition-opacity duration-150"
                        style={{
                          height: `${20 + Math.sin(i * 0.3) * 8}px`,
                          opacity: isPlayed ? 1 : 0.4,
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {formatCountdown(Math.round((reviewAudioProgress / 100) * recordedDuration))}/
                {formatCountdown(recordedDuration)}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={deleteRecording}
                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 touch-action-manipulation min-h-[44px]"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                size="sm"
                onClick={sendAudioMessage}
                className="gap-1.5 touch-action-manipulation min-h-[44px] min-w-[70px]"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedImagePreviewUrl && (
        <div className="px-4 py-3 border-t bg-muted/50 sticky bottom-0 z-10">
          <div className="flex items-start gap-3">
            <div className="relative">
              <img
                src={selectedImagePreviewUrl || "/placeholder.svg"}
                alt="Preview"
                className="rounded-lg max-w-[200px] max-h-[200px] object-cover"
              />
              {isProcessingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">Processing...</div>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                {selectedImageFile?.name}
                <br />
                {selectedImageFile && `${(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB`}
              </div>
              <div className="flex gap-2">
                <Button onClick={sendImageMessage} disabled={isProcessingImage} size="sm" className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
                <Button
                  onClick={cancelImageSelection}
                  disabled={isProcessingImage}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4 flex-shrink-0 bg-background sticky bottom-0 z-10">
        <div className="flex gap-2 items-end">
          <Input
            value={inputValue} // Renamed from 'message' to 'inputValue' for consistency
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={
              !isConnected ||
              isInputDisabled ||
              recordingState === "recording" ||
              recordedAudioBlob !== null ||
              selectedImageFile !== null ||
              hasWrongKey // Disable input if wrong key
            }
            className="flex-1"
          />

          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFileSelect} className="hidden" />
          <Button
            size="icon"
            variant="outline"
            className="rounded-full shrink-0 bg-transparent"
            onClick={openImageSourceDialog}
            disabled={
              !isConnected ||
              isInputDisabled ||
              recordingState === "recording" ||
              recordedAudioBlob !== null ||
              selectedImageFile !== null ||
              hasWrongKey // Disable button if wrong key
            }
            title="Send image"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full shrink-0 bg-transparent"
            onClick={startRecording}
            disabled={
              !isConnected ||
              isInputDisabled ||
              recordingState === "recording" ||
              recordedAudioBlob !== null ||
              selectedImageFile !== null ||
              hasWrongKey // Disable button if wrong key
            }
            title="Record voice message"
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={
              !isConnected ||
              isInputDisabled ||
              !inputValue.trim() ||
              recordingState === "recording" ||
              recordedAudioBlob !== null ||
              selectedImageFile !== null ||
              hasWrongKey // Disable button if wrong key
            }
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault() // Prevent form submission if not using form submit
              sendMessage()
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showImageSourceDialog && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageSourceDialog(false)}
        >
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Select Image Source</h3>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => selectImageSource("camera")}
                className="w-full justify-start gap-3 h-14"
                variant="outline"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </Button>
              <Button
                onClick={() => selectImageSource("gallery")}
                className="w-full justify-start gap-3 h-14"
                variant="outline"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Choose from Gallery</span>
              </Button>
            </div>
            <Button onClick={() => setShowImageSourceDialog(false)} variant="ghost" className="w-full mt-4">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage || "/placeholder.svg"}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
