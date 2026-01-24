"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Plug, MessageSquare, FileUp, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react"
import { Footer } from "@/components/footer"
import { getApiBase, getWsBase } from "@/lib/api"

type StatusState = "idle" | "testing" | "ok" | "error"

type ComponentStatus = "unknown" | "up" | "down"

interface Metrics {
  roomsCreated: number
  otmCreated: number
  filesCreated: number
}

interface StatusCardData {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: StatusState
  autoRun?: boolean
  steps?: string[]
  errorMessage?: string
}

function StatusBadge({ status }: { status: StatusState }) {
  if (status === "testing") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-medium border border-yellow-500/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Testing...
      </div>
    )
  }

  if (status === "ok") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium border border-green-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        OK
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-500/20">
        <AlertCircle className="w-3.5 h-3.5" />
        Issue
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-sm font-medium border border-border">
      Not tested
    </div>
  )
}

function StatusCard({
  data,
  onTest,
}: {
  data: StatusCardData
  onTest: () => void
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-secondary">
            <data.icon className="w-5 h-5 text-foreground" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-lg font-medium text-foreground">{data.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {!data.autoRun && data.status === "idle" && (
        <Button onClick={onTest} className="w-full rounded-xl" disabled={data.status === "testing"}>
          {data.status === "testing" ? "Testing..." : "Run Deep Check"}
        </Button>
      )}

      {data.steps && data.steps.length > 0 && (
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
          {data.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      {data.errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive">{data.errorMessage}</p>
        </div>
      )}
    </div>
  )
}

function StatusTile({ title, status }: { title: string; status: ComponentStatus }) {
  const statusConfig = {
    up: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-600 dark:text-green-400",
      dot: "bg-green-500",
      label: "Operational",
    },
    down: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
      label: "Down",
    },
    unknown: {
      bg: "bg-secondary",
      border: "border-border",
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
      label: "Checking...",
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4 space-y-2`}>
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-medium text-foreground">{value}</p>
    </div>
  )
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US")
}

export default function StatusPage() {
  const [apiHealth, setApiHealth] = useState<StatusCardData>({
    title: "API Health",
    description: "Checks whether the backend API is reachable.",
    icon: Shield,
    status: "testing",
    autoRun: true,
  })

  const [wsRelay, setWsRelay] = useState<StatusCardData>({
    title: "WebSocket Relay",
    description: "Tests the encrypted relay used for rooms.",
    icon: Plug,
    status: "idle",
  })

  const [otm, setOtm] = useState<StatusCardData>({
    title: "One-Time Messages",
    description: "Verifies that one-time links can be created, opened once, and then destroyed.",
    icon: MessageSquare,
    status: "idle",
  })

  const [fileDrop, setFileDrop] = useState<StatusCardData>({
    title: "Private File Drop",
    description: "Tests the one-time, encrypted file drop endpoint.",
    icon: FileUp,
    status: "idle",
  })

  const [status, setStatus] = useState({
    api: "unknown" as ComponentStatus,
    metrics: "unknown" as ComponentStatus,
  })
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [metricsError, setMetricsError] = useState(false)

  useEffect(() => {
    const checkRelayHealth = async () => {
      const relayBase = process.env.NEXT_PUBLIC_RELAY_BASE_URL
      if (!relayBase) {
        setStatus((prev) => ({ ...prev, api: "down" }))
        return
      }

      try {
        const response = await fetch(`${relayBase}/health`)
        const data = await response.json()

        if (response.status === 200 && data.status === "ok") {
          setStatus((prev) => ({ ...prev, api: "up" }))
        } else {
          setStatus((prev) => ({ ...prev, api: "down" }))
        }
      } catch (error) {
        setStatus((prev) => ({ ...prev, api: "down" }))
      }
    }

    // Initial check
    checkRelayHealth()

    // Poll every 30 seconds
    const interval = setInterval(checkRelayHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  // API Health Check - Auto-run on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiBase = getApiBase()
        const response = await fetch(`${apiBase}/health`)
        const data = await response.json()

        if (response.status === 200 && data.status === "ok") {
          setApiHealth((prev) => ({ ...prev, status: "ok" }))
        } else {
          setApiHealth((prev) => ({
            ...prev,
            status: "error",
            errorMessage: "Health endpoint did not respond as expected.",
          }))
        }
      } catch (error) {
        setApiHealth((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Failed to connect to the API.",
        }))
      }
    }

    checkHealth()
  }, [])

  useEffect(() => {
    const fetchMetrics = async () => {
      const apiBase = getApiBase()

      try {
        const metricsResponse = await fetch(`${apiBase}/metrics`, { cache: "no-store" })

        if (metricsResponse.status === 200) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData)
          setMetricsError(false)
          setStatus((prev) => ({ ...prev, metrics: "up" }))
        } else {
          setMetricsError(true)
          setStatus((prev) => ({ ...prev, metrics: "down" }))
        }
      } catch (error) {
        setMetricsError(true)
        setStatus((prev) => ({ ...prev, metrics: "down" }))
      }
    }

    // Initial fetch
    fetchMetrics()

    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  // WebSocket Relay Check
  const testWebSocketRelay = () => {
    setWsRelay((prev) => ({ ...prev, status: "testing", steps: [], errorMessage: undefined }))

    try {
      const wsBase = getWsBase()
      const randomId = Math.random().toString(36).substring(2, 15)
      const wsUrl = `${wsBase}?roomId=healthcheck-${randomId}`

      const ws = new WebSocket(wsUrl)
      const timeout = setTimeout(() => {
        ws.close()
        setWsRelay((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Connection timed out after 3 seconds.",
        }))
      }, 3000)

      ws.onopen = () => {
        clearTimeout(timeout)
        ws.close()
        setWsRelay((prev) => ({
          ...prev,
          status: "ok",
          steps: ["WebSocket connection established ✓", "Relay reachable from your browser ✓"],
        }))
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        setWsRelay((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Relay not reachable from your browser.",
        }))
      }
    } catch (error) {
      setWsRelay((prev) => ({
        ...prev,
        status: "error",
        errorMessage: "Failed to create WebSocket connection.",
      }))
    }
  }

  // One-Time Messages Check
  const testOtm = async () => {
    setOtm((prev) => ({ ...prev, status: "testing", steps: [], errorMessage: undefined }))

    try {
      const apiBase = getApiBase()

      // Step 1: Create dummy ciphertext
      const dummyCiphertext = {
        ciphertext: {
          iv: "dummy-iv",
          ciphertext: "dummy-cipher",
          mimeType: "text/plain",
          size: 16,
        },
      }

      // Step 2: POST to /otm
      const createResponse = await fetch(`${apiBase}/otm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dummyCiphertext),
      })

      if (!createResponse.ok || createResponse.status !== 201) {
        setOtm((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Could not create OTM payload.",
        }))
        return
      }

      const { id } = await createResponse.json()

      // Step 3: First GET
      const firstGetResponse = await fetch(`${apiBase}/otm/${id}`)
      if (!firstGetResponse.ok || firstGetResponse.status !== 200) {
        setOtm((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "First read failed.",
        }))
        return
      }

      const firstData = await firstGetResponse.json()
      if (!firstData.ciphertext) {
        setOtm((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "First read did not return ciphertext.",
        }))
        return
      }

      // Step 4: Second GET
      const secondGetResponse = await fetch(`${apiBase}/otm/${id}`)
      const secondData = await secondGetResponse.json()

      if (secondGetResponse.status === 404 || secondData.used === true) {
        setOtm((prev) => ({
          ...prev,
          status: "ok",
          steps: ["Created dummy OTM link ✓", "Readable once ✓", "Second read blocked ✓"],
        }))
      } else if (secondGetResponse.status === 200 && secondData.ciphertext) {
        setOtm((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "OTM is not enforcing one-time semantics.",
        }))
      } else {
        setOtm((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Unexpected response on second read.",
        }))
      }
    } catch (error) {
      setOtm((prev) => ({
        ...prev,
        status: "error",
        errorMessage: "Test failed with an error.",
      }))
    }
  }

  // Private File Drop Check
  const testFileDrop = async () => {
    setFileDrop((prev) => ({ ...prev, status: "testing", steps: [], errorMessage: undefined }))

    try {
      const apiBase = getApiBase()

      // Step 1: Create dummy ciphertext
      const dummyCiphertext = {
        ciphertext: {
          iv: "dummy-iv",
          ciphertext: "dummy-file",
          mimeType: "text/plain",
          name: "dummy.txt",
          size: 18,
        },
      }

      // Step 2: POST to /file
      const createResponse = await fetch(`${apiBase}/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dummyCiphertext),
      })

      if (!createResponse.ok || createResponse.status !== 201) {
        setFileDrop((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Could not create file payload.",
        }))
        return
      }

      const { id } = await createResponse.json()

      // Step 3: First GET
      const firstGetResponse = await fetch(`${apiBase}/file/${id}`)
      if (!firstGetResponse.ok || firstGetResponse.status !== 200) {
        setFileDrop((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "First read failed.",
        }))
        return
      }

      const firstData = await firstGetResponse.json()
      if (!firstData.ciphertext) {
        setFileDrop((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "First read did not return ciphertext.",
        }))
        return
      }

      // Step 4: Second GET
      const secondGetResponse = await fetch(`${apiBase}/file/${id}`)
      const secondData = await secondGetResponse.json()

      if (secondGetResponse.status === 404 || secondData.used === true) {
        setFileDrop((prev) => ({
          ...prev,
          status: "ok",
          steps: ["Created dummy file drop ✓", "Download once ✓", "Second access blocked ✓"],
        }))
      } else if (secondGetResponse.status === 200 && secondData.ciphertext) {
        setFileDrop((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "File drop is not enforcing one-time semantics.",
        }))
      } else {
        setFileDrop((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Unexpected response on second read.",
        }))
      }
    } catch (error) {
      setFileDrop((prev) => ({
        ...prev,
        status: "error",
        errorMessage: "Test failed with an error.",
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium text-foreground">Service Status</h1>
          <p className="text-muted-foreground">Check the metrics and health of zkChat backend services.</p>
        </div>

        <div className="space-y-6">
          {/* Existing Usage Metrics section - kept unchanged */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-foreground">Usage Metrics</h2>
            {metrics === null && !metricsError && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading usage metrics...</span>
              </div>
            )}
            {metricsError && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Metrics currently unavailable. This does not affect zkChat functionality.
                </p>
              </div>
            )}
            {metrics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard label="Total Chats Created" value={formatNumber(metrics.roomsCreated)} />
                  <MetricCard label="Total Pastebins Created" value={formatNumber(metrics.otmCreated)} />
                  <MetricCard label="Total Files Created" value={formatNumber(metrics.filesCreated)} />
                </div>
                <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These numbers are anonymous, aggregate counters only. We never log message contents, room IDs, IPs,
                    or identities. The server stores only total counts to show long-term usage, not who used zkChat.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Deep Diagnostics section - kept unchanged */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-foreground">Deep Diagnostics</h2>
            <StatusCard data={apiHealth} onTest={() => {}} />
            <StatusCard data={wsRelay} onTest={testWebSocketRelay} />

            {wsRelay.status === "ok" && (
              <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This only checks connectivity. The relay still only sees encrypted blobs, never your messages.
                </p>
              </div>
            )}

            <StatusCard data={otm} onTest={testOtm} />
            <StatusCard data={fileDrop} onTest={testFileDrop} />
          </div>

          {/* Privacy section - kept unchanged */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary">
                <Info className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground">Privacy Note</h3>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2 pl-10">
              <p>
                All status and usage data shown here is fully aggregated and anonymous. We only track global counters
                (how many rooms, one-time messages, and file drops have been created) — never who used them or what they
                contain.
              </p>
              <p>
                Deep diagnostic checks only use tiny dummy payloads. No real messages, files or keys are ever inspected.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
