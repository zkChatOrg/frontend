import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Generate cryptographically random room ID (32 characters)
    const array = new Uint8Array(24)
    crypto.getRandomValues(array)
    const roomId = Array.from(array)
      .map((b) => b.toString(36).padStart(2, "0"))
      .join("")
      .substring(0, 32)

    return NextResponse.json({ roomId })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
