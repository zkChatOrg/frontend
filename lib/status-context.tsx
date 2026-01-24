"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getApiBase } from "@/lib/api"

type ComponentStatus = "unknown" | "up" | "down" | "degraded"

interface StatusContextValue {
  apiStatus: ComponentStatus
  metricsStatus: ComponentStatus
  lastChecked: number | null
}

const StatusContext = createContext<StatusContextValue>({
  apiStatus: "unknown",
  metricsStatus: "unknown",
  lastChecked: null,
})

export function useStatus() {
  return useContext(StatusContext)
}

export function StatusProvider({ children }: { children: ReactNode }) {
  const [apiStatus, setApiStatus] = useState<ComponentStatus>("unknown")
  const [metricsStatus, setMetricsStatus] = useState<ComponentStatus>("unknown")
  const [lastChecked, setLastChecked] = useState<number | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const apiBase = getApiBase()

      // Check API health
      try {
        const healthResponse = await fetch(`${apiBase}/health`, { cache: "no-store" })
        const healthData = await healthResponse.json()

        if (healthResponse.status === 200 && healthData.status === "ok") {
          setApiStatus("up")
        } else {
          setApiStatus("down")
        }
      } catch (error) {
        setApiStatus("down")
      }

      // Check metrics
      try {
        const metricsResponse = await fetch(`${apiBase}/metrics`, { cache: "no-store" })

        if (metricsResponse.status === 200) {
          const metricsData = await metricsResponse.json()
          if (metricsData && typeof metricsData.roomsCreated === "number") {
            setMetricsStatus("up")
          } else {
            setMetricsStatus("down")
          }
        } else {
          setMetricsStatus("down")
        }
      } catch (error) {
        setMetricsStatus("down")
      }

      setLastChecked(Date.now())
    }

    // Initial check
    checkStatus()

    // Poll every 5 minutes for footer
    const interval = setInterval(checkStatus, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return <StatusContext.Provider value={{ apiStatus, metricsStatus, lastChecked }}>{children}</StatusContext.Provider>
}
