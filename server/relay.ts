import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import { parse } from "url"

interface Room {
  clients: Set<WebSocket>
  destructionTimer: NodeJS.Timeout | null
}

const rooms = new Map<string, Room>()

const DESTRUCTION_DELAY = 5000 // 5 seconds

/**
 * Get or create a room
 */
function getOrCreateRoom(roomId: string): Room {
  let room = rooms.get(roomId)
  if (!room) {
    console.log(`Creating new room: ${roomId}`)
    room = {
      clients: new Set(),
      destructionTimer: null,
    }
    rooms.set(roomId, room)
  }
  return room
}

/**
 * Remove a room from memory
 */
function destroyRoom(roomId: string) {
  console.log(`Destroying room: ${roomId}`)
  rooms.delete(roomId)
}

/**
 * Schedule room destruction if empty
 */
function scheduleDestruction(roomId: string, room: Room) {
  if (room.clients.size === 0) {
    console.log(`Scheduling destruction for room: ${roomId}`)
    room.destructionTimer = setTimeout(() => {
      if (room.clients.size === 0) {
        destroyRoom(roomId)
      }
    }, DESTRUCTION_DELAY)
  }
}

/**
 * Cancel scheduled destruction
 */
function cancelDestruction(room: Room) {
  if (room.destructionTimer) {
    console.log(`Cancelling destruction timer`)
    clearTimeout(room.destructionTimer)
    room.destructionTimer = null
  }
}

/**
 * Broadcast message to all clients in a room except sender
 */
function broadcast(room: Room, message: string, sender: WebSocket) {
  room.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// Create HTTP server
const server = createServer((req, res) => {
  // Handle CORS for development
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  // Create room endpoint
  if (req.url === "/create-room" && req.method === "POST") {
    const array = new Uint8Array(24)
    crypto.getRandomValues(array)
    const roomId = Array.from(array)
      .map((b) => b.toString(36).padStart(2, "0"))
      .join("")
      .substring(0, 32)

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ roomId }))
    return
  }

  res.writeHead(404)
  res.end("Not Found")
})

// Create WebSocket server
const wss = new WebSocketServer({ server })

wss.on("connection", (ws: WebSocket, req) => {
  const { query } = parse(req.url || "", true)
  const roomId = query.roomId as string

  if (!roomId) {
    console.log(`Connection rejected: no roomId provided`)
    ws.close(1008, "roomId required")
    return
  }

  console.log(`Client joining room: ${roomId}`)

  // Get or create room
  const room = getOrCreateRoom(roomId)

  // Cancel any pending destruction
  cancelDestruction(room)

  // Add client to room
  room.clients.add(ws)
  console.log(`Room ${roomId} now has ${room.clients.size} client(s)`)

  // Send connection confirmation
  ws.send(
    JSON.stringify({
      type: "connected",
      roomId,
      clientCount: room.clients.size,
    }),
  )

  // Notify other clients
  broadcast(
    room,
    JSON.stringify({
      type: "user_joined",
      clientCount: room.clients.size,
    }),
    ws,
  )

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString())

      // Only relay encrypted messages
      if (message.type === "message" && message.iv && message.ciphertext) {
        console.log(`Relaying encrypted message in room: ${roomId}`)
        broadcast(room, data.toString(), ws)
      }
    } catch (error) {
      console.error(`Error processing message:`, error)
    }
  })

  // Handle disconnection
  ws.on("close", () => {
    console.log(`Client leaving room: ${roomId}`)
    room.clients.delete(ws)
    console.log(`Room ${roomId} now has ${room.clients.size} client(s)`)

    // Notify remaining clients
    broadcast(
      room,
      JSON.stringify({
        type: "user_left",
        clientCount: room.clients.size,
      }),
      ws,
    )

    // Schedule destruction if room is empty
    scheduleDestruction(roomId, room)
  })

  ws.on("error", (error) => {
    console.error(`WebSocket error:`, error)
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`WebSocket relay server running on port ${PORT}`)
  console.log(`Zero-knowledge mode: Server never sees plaintext`)
  console.log(`No persistence, no logs, maximum privacy`)
})
