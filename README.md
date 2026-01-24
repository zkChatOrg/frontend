# zkChat

Military-Grade Privacy For Everyday. End-to-end encrypted (AES-256-GCM) conversations, one-time messages and file drops.

Zero-knowledge ephemeral communication platform. No storage, no logs, no identity.

## Features

### 🔒 Encrypted Group Rooms
End-to-end encrypted chat rooms that self-destruct when empty or expire based on a timer. Perfect for temporary team discussions, planning events, or private group conversations without leaving traces.

**Key Features:**
- AES-256-GCM end-to-end encryption
- Configurable room expiration (5 min to 24 hours, or never)
- Real-time WebSocket messaging
- Burn room feature for instant destruction
- No message history or persistent storage

**Use Cases:** Private group chats, incident response rooms, temporary project discussions, secure planning sessions

---

### 📝 One-Time Messages (OTM)
Secure pastebin for secrets that self-destruct after a single view. Share passwords, API keys, or sensitive notes with confidence knowing they'll vanish after being read once.

**Key Features:**
- Client-side AES-256-GCM encryption before upload
- Single-read enforcement (message deleted after first view)
- 7-day automatic expiration
- QR code sharing support
- 8,000 character limit

**Use Cases:** Password sharing, API key distribution, temporary credentials, confidential one-off messages, recovery phrase sharing

---

### 📁 Private File Drop
One-time encrypted file sharing with automatic deletion after download. Upload files up to 10 MB that self-destruct after the first download or 24 hours.

**Key Features:**
- End-to-end file encryption (AES-256-GCM)
- Raw binary upload (33% more efficient than base64)
- 24-hour expiration or instant deletion after download
- Preview support for images and PDFs
- Zero metadata leakage to server

**Use Cases:** Secure document sharing, credential file transfer, sensitive screenshots, medical/legal files, temporary file sharing

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Environment Setup

Create a `.env.local` file with the following variables:

\`\`\`bash
# WebSocket relay server (required for group rooms)
NEXT_PUBLIC_WS_URL=wss://your-relay-server.com

# API base URL (required for OTM and file drops)
NEXT_PUBLIC_API_BASE=https://your-api-server.com

# Optional: Port for local development
PORT=3000
\`\`\`

### 2. Install and Run

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open http://localhost:3000

---

## Environment Variables

| Variable | Required | Used By | Description | Example |
|----------|----------|---------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | Yes | Group Rooms | WebSocket relay server URL | `wss://relay.example.com` |
| `NEXT_PUBLIC_API_BASE` | Yes | OTM, File Drops | API server base URL | `https://api.example.com` |
| `PORT` | No | All | Local dev server port | `3000` |

The app will show configuration errors if required environment variables are not set for the feature you're trying to use.

---

## Architecture

### Frontend (Next.js)
- **Group Rooms**: WebSocket client with real-time E2E encryption
- **OTM**: Client-side text encryption before upload
- **File Drop**: Client-side file encryption with raw binary upload
- All encryption keys stay in URL fragments (never sent to server)

### Backend Services

#### WebSocket Relay (Group Rooms)
- Pure relay - forwards encrypted messages only
- In-memory room registry (no database)
- Automatic cleanup: rooms deleted 5s after last user leaves
- Zero message storage or logging

#### API Server (OTM + File Drops)
- REST endpoints for encrypted blob storage
- Single-read enforcement for OTM
- Single-download enforcement for files
- Automatic expiration (7 days for OTM, 24 hours for files)
- No decryption capability (server is cryptographically blind)

### Security Model

**Zero-Knowledge Principles:**
- Server never sees plaintext content
- Encryption keys in URL fragments (`#key=...`) never transmitted to server
- Per-message/file unique encryption (AES-GCM with random IV)
- No user accounts, identities, or authentication required

**What the server NEVER sees:**
- Plaintext messages or file content
- Encryption keys
- User identities
- Original filenames or metadata (for files)

**What the server DOES see:**
- Room IDs (random, meaningless)
- Encrypted blob IDs
- Encrypted ciphertext (indecipherable without keys)
- Connection counts and timing metadata

---

## Development

### Local Backend Setup

#### 1. WebSocket Relay Server (Group Rooms)

\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

Default port: 3001  
Set environment variable: `NEXT_PUBLIC_WS_URL=ws://localhost:3001`

#### 2. API Server (OTM + File Drops)

You'll need to deploy your own API server with the following endpoints:

**POST /otm** - Store encrypted one-time message
\`\`\`json
Request: { "ciphertext": "iv.ciphertext" }
Response: { "id": "abc123" }
\`\`\`

**GET /otm/:id** - Retrieve and delete one-time message (single-read)
\`\`\`json
Response: { "ciphertext": "iv.ciphertext" }
\`\`\`

**POST /file** - Store encrypted file (raw binary)
\`\`\`
Content-Type: application/octet-stream
Body: <encrypted binary blob>
Response: { "id": "xyz789" }
\`\`\`

**GET /file/:id** - Retrieve and delete file (single-download)
\`\`\`
Response: <encrypted binary blob>
\`\`\`

Set environment variable: `NEXT_PUBLIC_API_BASE=http://localhost:3002`

---

## Deployment

### Frontend (Vercel)

Deploy the Next.js app:
\`\`\`bash
vercel
\`\`\`

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_WS_URL`: Your WebSocket relay URL (wss://...)
- `NEXT_PUBLIC_API_BASE`: Your API server URL (https://...)

### WebSocket Relay Backend

Deploy to any Node.js hosting platform that supports WebSockets:

\`\`\`bash
cd server
npx tsc
NODE_ENV=production PORT=3001 node dist/relay.js
\`\`\`

**Recommended hosts:** Railway, Fly.io, DigitalOcean App Platform, AWS Fargate

**Important:** Configure reverse proxy to:
- Disable access logs
- Use WSS (WebSocket over TLS)
- Allow WebSocket upgrade headers

### API Server Backend

Deploy your API implementation to any hosting platform. Ensure:
- HTTPS/TLS for all endpoints
- CORS configured for your frontend domain
- Automatic cleanup of expired blobs (7 days for OTM, 24h for files)
- No logging of request bodies or sensitive data

---

## API Reference

### Group Rooms API

**POST /api/create-room**
\`\`\`json
Response: { "roomId": "abc123" }
\`\`\`

**WebSocket /relay?roomId=<id>**

Client → Server:
\`\`\`json
{
  "type": "message",
  "iv": "base64url...",
  "ciphertext": "base64url..."
}
\`\`\`

Server → Client:
\`\`\`json
{
  "type": "connected|user_joined|user_left|message",
  "clientCount": 2,
  "iv": "base64url...",
  "ciphertext": "base64url..."
}
\`\`\`

### One-Time Messages API

**POST /otm**
\`\`\`json
Request: { "ciphertext": "iv.ciphertext" }
Response: { "id": "abc123" }
\`\`\`

**GET /otm/:id**
\`\`\`json
Response: { "ciphertext": "iv.ciphertext" }
\`\`\`
Note: Returns 410 if already viewed or expired

### File Drop API

**POST /file**
\`\`\`
Content-Type: application/octet-stream
Body: <encrypted binary>
Response: { "id": "xyz789" }
\`\`\`

**GET /file/:id**
\`\`\`
Response: <encrypted binary>
Content-Type: application/octet-stream
\`\`\`
Note: Returns 410 if already downloaded or expired

---

## Security Best Practices

### For Users:
- Share links via secure channels (Signal, WhatsApp E2E, encrypted email)
- Verify link includes `#` fragment before sharing
- Close browser tab when done (clears keys from memory)
- Don't screenshot or save sensitive content outside the app
- Use burn room feature for maximum privacy in group chats

### For Operators:
- Use HTTPS/WSS everywhere
- Disable detailed logging (especially request bodies)
- Implement rate limiting to prevent abuse
- Set up automatic blob cleanup for expired content
- Monitor for unusual traffic patterns
- Never store decryption keys (mathematically impossible anyway)

---

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Encryption**: Web Crypto API (AES-256-GCM, 256-bit keys, 96-bit IV)
- **Real-time**: WebSocket (ws library)
- **Backend**: Node.js, Express (API server optional)
- **Hosting**: Vercel (frontend), Railway/Fly.io (backend)

---

## Project Structure

\`\`\`
frontend/
|-- app/                        # Next.js App Router
|   |-- layout.tsx              # Root layout
|   |-- page.tsx                # Home / room creation
|   |-- room/[id]/              # Encrypted group chat
|   |-- otm/                    # One-time messages
|   |   |-- page.tsx            # Create OTM
|   |   +-- [id]/               # View OTM
|   |-- file/                   # Private file drop
|   |   |-- page.tsx            # Upload file
|   |   +-- [id]/               # Download file
|   |-- status/                 # Service diagnostics
|   |-- blog/                   # Blog pages
|   +-- api/                    # API routes
|       +-- create-room/        # Room creation endpoint
|-- components/                 # React components
|   |-- ui/                     # shadcn/ui primitives
|   |-- nav-header.tsx          # Navigation
|   +-- qr-modal.tsx            # QR code sharing
|-- lib/                        # Core utilities
|   |-- crypto.ts               # AES-256-GCM encryption
|   |-- ws.ts                   # WebSocket client
|   |-- room.ts                 # Room management
|   +-- utils.ts                # Helpers
|-- hooks/                      # React hooks
+-- server/                     # WebSocket relay (dev)
    +-- relay.ts
\`\`\`

---

## Contributing

Contributions are welcome! Areas for improvement:
- Additional language support for UI
- Mobile app implementations
- Alternative backend implementations
- Security audits and improvements
- Performance optimizations

Please open issues or PRs on GitHub.

---

## License

Copyright (C) 2026 OpenZK LLC

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

**OpenZK LLC** — Wyoming, United States.

---

## Disclaimer

This software is provided "as-is" for educational and research purposes. While we implement strong cryptographic protections:
- No software is 100% secure
- Use at your own risk for sensitive communications
- Operators should comply with local data protection laws
- Not intended to circumvent legal obligations or lawful intercept requirements

For maximum security, combine with other secure communication practices and threat modeling appropriate to your use case.
