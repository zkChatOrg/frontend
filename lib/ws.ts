import { getWsBase } from "./api"

/**
 * WebSocket URL helper for connecting to the relay server.
 */

/**
 * Get the WebSocket URL for a specific room
 * @param roomId - The room identifier
 * @returns The full WebSocket URL with roomId query parameter
 * @throws Error if API base is not configured or roomId is missing
 */
export function getWsUrl(roomId: string): string {
  if (!roomId) {
    throw new Error("roomId is required but was undefined")
  }

  const wsBase = getWsBase()
  return `${wsBase}?roomId=${encodeURIComponent(roomId)}`
}

/**
 * Check if the WebSocket URL is configured
 * @returns true if API base is set
 */
export function isWsConfigured(): boolean {
  try {
    getWsBase()
    return true
  } catch {
    return false
  }
}
