"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Timer,
  Mic,
  MessageSquare,
  ImageIcon,
  Flame,
  Play,
  Pause,
  Lock,
  Key,
  Server,
  Trash2,
  Eye,
  Shield,
  ArrowRight,
  Clock,
  Users,
  Send,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react"
import { generateEncryptionKey } from "@/lib/crypto"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { generateRoomId } from "@/lib/room"

export default function ClientChatPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [expiresIn, setExpiresIn] = useState("1h")
  const [roomCreated, setRoomCreated] = useState(false)
  const [roomUrl, setRoomUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const [demoMessage, setDemoMessage] = useState("")
  const [demoMessages, setDemoMessages] = useState<Array<{ text: string; isOwn: boolean; time: string }>>([
    { text: "Let's switch to zkChat", isOwn: false, time: "10:23" },
  ])
  const [hasSentDemo, setHasSentDemo] = useState(false)

  const [isVoicePlaying, setIsVoicePlaying] = useState(false)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const voiceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isBurning, setIsBurning] = useState(false)
  const [burnProgress, setBurnProgress] = useState(0)

  const [photoState, setPhotoState] = useState<"idle" | "uploading" | "sent">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)

  const [timerSeconds, setTimerSeconds] = useState(48 * 60 + 23) // Start at 48:23

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 48 * 60 + 23))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendDemo = () => {
    if (demoMessage.trim() && !hasSentDemo) {
      const now = new Date()
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`
      setDemoMessages((prev) => [...prev, { text: demoMessage, isOwn: true, time }])
      setDemoMessage("")
      setHasSentDemo(true)
    }
  }

  const handleVoicePlay = () => {
    if (isVoicePlaying) {
      setIsVoicePlaying(false)
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current)
      }
    } else {
      setIsVoicePlaying(true)
      setVoiceProgress(0)
      voiceIntervalRef.current = setInterval(() => {
        setVoiceProgress((prev) => {
          if (prev >= 100) {
            setIsVoicePlaying(false)
            if (voiceIntervalRef.current) {
              clearInterval(voiceIntervalRef.current)
            }
            return 0
          }
          return prev + 2
        })
      }, 100)
    }
  }

  const handleBurn = () => {
    if (isBurning) return
    setIsBurning(true)
    setBurnProgress(0)
    const interval = setInterval(() => {
      setBurnProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsBurning(false)
            setBurnProgress(0)
          }, 1500)
          return 100
        }
        return prev + 4
      })
    }, 50)
  }

  const handlePhotoUpload = () => {
    if (photoState !== "idle") return
    setPhotoState("uploading")
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setPhotoState("sent")
          setTimeout(() => {
            setPhotoState("idle")
            setUploadProgress(0)
          }, 3000)
          return 100
        }
        return prev + 5
      })
    }, 80)
  }

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const encryptionKey = generateEncryptionKey()
      const roomId = generateRoomId()

      let ttl: number
      switch (expiresIn) {
        case "5m":
          ttl = 5 * 60 * 1000
          break
        case "15m":
          ttl = 15 * 60 * 1000
          break
        case "1h":
          ttl = 60 * 60 * 1000
          break
        case "6h":
          ttl = 6 * 60 * 60 * 1000
          break
        case "24h":
          ttl = 24 * 60 * 60 * 1000
          break
        case "never":
          ttl = 0
          break
        default:
          ttl = 60 * 60 * 1000
      }

      const createdAt = Date.now()
      const fragment = `key=${encryptionKey}&createdAt=${createdAt}&ttl=${ttl}`
      const link = `${window.location.origin}/room/${roomId}#${fragment}`

      setRoomUrl(link)
      setRoomCreated(true)
    } catch (error) {
      console.error("Failed to create room:", error)
      alert("Failed to create room. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleJoinRoom = () => {
    router.push(roomUrl)
  }

  const getExpiryLabel = () => {
    switch (expiresIn) {
      case "5m":
        return "5 minutes"
      case "15m":
        return "15 minutes"
      case "1h":
        return "1 hour"
      case "6h":
        return "6 hours"
      case "24h":
        return "24 hours"
      case "never":
        return "Never"
      default:
        return "1 hour"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center p-4 py-16 overflow-hidden">
        {/* Simple grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.3,
            maskImage:
              "radial-gradient(ellipse 70% 70% at center, transparent 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 70% at center, transparent 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>AES-256-GCM Encryption</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-tight">
            <span className="text-foreground">Military-Grade</span>
            <br />
            <span className="text-muted-foreground">Private Chats</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
            End-to-end encrypted chat rooms that self-destruct. No accounts. No metadata.{" "}
            <strong className="text-foreground">Everything burns when you leave.</strong>
          </p>

          {roomCreated ? (
            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-lg max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Your secure room is ready</h2>
                <p className="text-sm text-muted-foreground">Link expires in {getExpiryLabel()}</p>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground break-all font-mono">{roomUrl}</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button className="flex-1 gap-2" onClick={handleJoinRoom}>
                  <ExternalLink className="w-4 h-4" />
                  Join Room
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Share this link via WhatsApp, iMessage, or any messaging app. Room will self-destruct when all users
                leave.
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Room expires in
                    </label>
                    <Select value={expiresIn} onValueChange={setExpiresIn}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select expiration time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5m">5 minutes</SelectItem>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="6h">6 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreateRoom} disabled={isCreating} className="w-full gap-2" size="lg">
                    {isCreating ? (
                      <>Creating...</>
                    ) : (
                      <>
                        Create Chat Room
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    E2E Encrypted
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Anonymous
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Auto-destruct
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <div className="border-t border-border bg-secondary/30 px-4 py-16 md:py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.15,
          }}
        />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              Private rooms. No traces.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every feature designed for privacy. See what's possible in zkChat rooms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1: Encrypted Messages - Interactive */}
            <div className="bg-background border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Encrypted Messages</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    End-to-end encrypted text with no server-side history
                  </p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 space-y-2.5 min-h-[140px] flex flex-col">
                <div className="flex-1 space-y-2 overflow-hidden">
                  {demoMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <div
                          className={`rounded-2xl px-3 py-1.5 text-xs ${
                            msg.isOwn ? "bg-primary text-primary-foreground" : "bg-blue-500 text-white"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span
                          className={`text-[10px] text-muted-foreground mt-0.5 block ${msg.isOwn ? "text-right" : "text-left"}`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <input
                    type="text"
                    placeholder={hasSentDemo ? "Message sent!" : "Try typing..."}
                    value={demoMessage}
                    onChange={(e) => setDemoMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendDemo()}
                    disabled={hasSentDemo}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendDemo}
                    disabled={!demoMessage.trim() || hasSentDemo}
                    className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    {hasSentDemo ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 2: Secure Voice Notes - Interactive */}
            <div className="bg-background border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Mic className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Secure Voice Notes</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Encrypted voice messages that never touch the server unencrypted
                  </p>
                </div>
              </div>

              <div
                className="bg-secondary/30 rounded-xl p-4 min-h-[120px] flex items-center cursor-pointer"
                onClick={handleVoicePlay}
              >
                <div className="w-full">
                  <div className="bg-primary text-primary-foreground rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                        {isVoicePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                      </div>
                      <div className="flex gap-0.5 items-end h-4 flex-1">
                        {[...Array(20)].map((_, i) => {
                          const barProgress = (i / 20) * 100
                          const isPlayed = voiceProgress > barProgress
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-current rounded-full transition-opacity"
                              style={{
                                height: `${10 + Math.sin(i * 0.5) * 6}px`,
                                opacity: isPlayed ? 1 : 0.4,
                              }}
                            />
                          )
                        })}
                      </div>
                      <span className="text-[10px] opacity-80 shrink-0 min-w-[32px] text-right">
                        {isVoicePlaying
                          ? `0:${Math.floor((voiceProgress / 100) * 11)
                              .toString()
                              .padStart(2, "0")}`
                          : "0:11"}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 text-right px-1">
                    {isVoicePlaying ? "Playing..." : "Tap to play"}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Encrypted Photos - Interactive */}
            <div className="bg-background border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <ImageIcon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Encrypted Photos</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Share images as encrypted messages, not public links
                  </p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                {photoState === "idle" && (
                  <button
                    onClick={handlePhotoUpload}
                    className="relative flex flex-col items-center gap-2 p-2 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer overflow-hidden group"
                  >
                    <img
                      src="/majestic-mountain-vista.png"
                      alt="Sample photo"
                      className="w-32 h-20 object-cover rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xs text-muted-foreground">Tap to encrypt & send</span>
                  </button>
                )}
                {photoState === "uploading" && (
                  <div className="w-full space-y-3">
                    <div className="relative mx-auto w-32 h-20 rounded-lg overflow-hidden">
                      <img
                        src="/majestic-mountain-vista.png"
                        alt="Encrypting..."
                        className="w-full h-full object-cover"
                        style={{
                          filter: `blur(${Math.max(0, 8 - (uploadProgress / 100) * 8)}px)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-100"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{uploadProgress}% encrypted</p>
                  </div>
                )}
                {photoState === "sent" && (
                  <div className="w-full">
                    <div className="bg-primary rounded-2xl p-2">
                      <div className="relative w-full h-20 rounded-lg overflow-hidden">
                        <img
                          src="/majestic-mountain-vista.png"
                          alt="Sent photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 text-right px-1">Encrypted & sent</div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature 4: Burn Rooms - Interactive */}
            <div className="bg-background border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Flame className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Burn the Room</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    One click to destroy the room state for everyone
                  </p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 min-h-[120px] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                {!isBurning ? (
                  <>
                    <div className="flex gap-2 opacity-60">
                      <div className="bg-muted rounded-xl px-3 py-1.5 text-xs">Secret message 1</div>
                      <div className="bg-muted rounded-xl px-3 py-1.5 text-xs">Secret message 2</div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={handleBurn} className="gap-1.5">
                      <Flame className="w-3 h-3" />
                      Burn Room
                    </Button>
                    <span className="text-[10px] text-muted-foreground">Clears history and destroys the room</span>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full animate-ping"
                        style={{
                          background: `hsl(${20 + i * 5}, 100%, ${50 + i * 3}%)`,
                          left: `${20 + Math.random() * 60}%`,
                          top: `${30 + Math.random() * 40}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.8s",
                          opacity: burnProgress < 100 ? 1 : 0,
                        }}
                      />
                    ))}
                    <div
                      className="flex gap-2 transition-all duration-500"
                      style={{
                        opacity: 1 - burnProgress / 100,
                        transform: `scale(${1 - burnProgress / 200}) translateY(${burnProgress / 3}px)`,
                        filter: `blur(${burnProgress / 20}px)`,
                      }}
                    >
                      <div className="bg-muted rounded-xl px-3 py-1.5 text-xs">Secret message 1</div>
                      <div className="bg-muted rounded-xl px-3 py-1.5 text-xs">Secret message 2</div>
                    </div>
                    {burnProgress >= 100 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </div>
                        <span className="text-xs text-destructive font-medium">Room Destroyed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Feature 5: Ephemeral by Design - spans full width */}
            <div className="bg-background border border-border rounded-2xl p-6 space-y-4 shadow-sm md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Timer className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Ephemeral by Design</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Rooms self-destruct when empty or timer expires
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border rounded-xl p-6 min-h-[120px] flex items-center justify-center gap-8">
                <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center relative z-10 shadow-sm">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeDasharray={`${(timerSeconds / (48 * 60 + 23)) * 226} 226`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Timer className="w-8 h-8 text-foreground" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-3xl font-mono font-semibold text-foreground tabular-nums">
                    {formatTimer(timerSeconds)}
                  </p>
                  <p className="text-sm text-muted-foreground">Time remaining until room destruction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Section */}
      <div className="border-t border-border px-4 py-16 md:py-20 bg-secondary/10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">The zkChat Lifecycle</h2>
            <p className="text-muted-foreground leading-relaxed">
              Understand exactly what happens to your messages from creation to destruction
            </p>
          </div>

          {/* Visual Lifecycle Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {/* Step 1: Create & Encrypt */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center relative z-10 shadow-sm">
                  <Key className="w-6 h-6" />
                  <span className="text-xs font-semibold mt-1">1</span>
                </div>
                <div className="flex-1 space-y-3 pt-2">
                  <h3 className="text-lg font-medium text-foreground">Create & Encrypt in Browser</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your message is encrypted with AES-256-GCM <strong className="text-foreground">before</strong>{" "}
                    leaving your device. The encryption key never touches the server—it lives only in the URL fragment
                    you share.
                  </p>
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span className="font-mono">Plaintext → AES-256-GCM → Ciphertext</span>
                    </div>
                    <div className="bg-background rounded-lg p-2 font-mono text-xs text-foreground break-all">
                      a7f3b2e9c4d1... <span className="text-muted-foreground">(encrypted blob)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Relay Transit */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center relative z-10 shadow-sm">
                  <Server className="w-6 h-6" />
                  <span className="text-xs font-semibold mt-1">2</span>
                </div>
                <div className="flex-1 space-y-3 pt-2">
                  <h3 className="text-lg font-medium text-foreground">Transit Through Relay (No Decryption)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The relay server only sees encrypted blobs. It{" "}
                    <strong className="text-foreground">cannot decrypt</strong> your messages because it doesn't have
                    the key. No plaintext, no identities, no metadata is ever stored.
                  </p>
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Server className="w-3 h-3" />
                      <span>Server sees:</span>
                    </div>
                    <div className="bg-background rounded-lg p-2 font-mono text-xs text-muted-foreground opacity-60">
                      ???????????????????????? <span className="text-xs">(unreadable ciphertext)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Decrypt & Read */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center relative z-10 shadow-sm">
                  <Eye className="w-6 h-6" />
                  <span className="text-xs font-semibold mt-1">3</span>
                </div>
                <div className="flex-1 space-y-3 pt-2">
                  <h3 className="text-lg font-medium text-foreground">Decrypt & Read in Recipient's Browser</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The recipient's browser uses the shared key from the URL to decrypt the message. Decryption happens{" "}
                    <strong className="text-foreground">entirely client-side</strong>—the server never sees the
                    plaintext.
                  </p>
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Key className="w-3 h-3" />
                      <span className="font-mono">Ciphertext + Key → Plaintext</span>
                    </div>
                    <div className="bg-background rounded-lg p-3 text-sm text-foreground">"Let's switch to zkChat"</div>
                  </div>
                </div>
              </div>

              {/* Step 4: Self-Destruct */}
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-destructive text-destructive-foreground flex flex-col items-center justify-center relative z-10 shadow-sm">
                  <Flame className="w-6 h-6" />
                  <span className="text-xs font-semibold mt-1">4</span>
                </div>
                <div className="flex-1 space-y-3 pt-2">
                  <h3 className="text-lg font-medium text-foreground">Self-Destruct on Exit</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When you close the tab or the timer expires, the room is destroyed. No history is saved—
                    <strong className="text-foreground">everything burns</strong>. Even if someone has the link, they
                    can't recover past messages.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <Trash2 className="w-3 h-3" />
                      <span className="font-semibold">Room destroyed • All messages deleted</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The encryption key is never logged, and the relay forgets the room ever existed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-0">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                Is zkChat more private than Signal or Session?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                For ephemeral communication, yes. Signal and Session require accounts and store metadata. zkChat
                requires nothing—no phone number, no email, no identity. The encryption key never touches our servers
                (it stays in the URL fragment), rooms auto-destruct when empty, and we maintain zero logs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                Can my ISP, employer, or government read my messages?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                No. Messages are encrypted in your browser with AES-256-GCM before transmission. Your ISP, employer, or
                any network observer sees only encrypted ciphertext traveling to our relay. They cannot see message
                content, who you're talking to, or the encryption key.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                What if someone hacks the zkChat server?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                They would find nothing useful. Our server only relays encrypted blobs—random bytes it cannot decrypt.
                We don't have your encryption keys. We don't store message history. Active rooms exist only in memory
                and vanish when connections close.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                What metadata do you store?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Essentially none. We don't log IP addresses long-term. We don't track who creates rooms or who joins
                them. We don't store message timestamps or sender identities. When everyone leaves, even room existence
                is deleted.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                What happens when I close the tab?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Your local message history (which only existed in browser memory) is gone. You disconnect from the room.
                If you were the last participant, the room is destroyed. Nothing persists on our servers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">
                How do one-time messages work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                You write a message, your browser encrypts it with AES-256-GCM, and uploads only the ciphertext. When
                someone opens the link, we serve the ciphertext once and immediately delete it. The message cannot be
                read again.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  )
}
