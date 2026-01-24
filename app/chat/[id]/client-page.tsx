"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Shield, Lock, MessageSquare } from "lucide-react"
import { Footer } from "@/components/footer"

export default function ClientChatInvitePage() {
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Chat Invitation
            </h1>
            <p className="text-muted-foreground">
              You've been invited to a private, end-to-end encrypted chat on zkChat.
            </p>
          </div>

          {/* App Required Notice */}
          <div className="bg-secondary/50 border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-foreground font-medium">
              <Smartphone className="w-5 h-5" />
              <span>iOS App Required</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Permanent encrypted chats are only available in the zkChat iOS app.
              Open this link on your iPhone to join the chat.
            </p>

            <div className="space-y-3 pt-2">
              <Button asChild className="w-full">
                <a href="https://apps.apple.com/app/zkchat" target="_blank" rel="noopener noreferrer">
                  Download zkChat for iOS
                </a>
              </Button>

              {currentUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUrl)
                  }}
                >
                  Copy Link to Open on iPhone
                </Button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <Shield className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Signal Protocol</p>
                <p className="text-xs text-muted-foreground">X3DH + Double Ratchet</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <Lock className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Local Storage</p>
                <p className="text-xs text-muted-foreground">Messages on device only</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
