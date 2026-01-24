"use client"

import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Shield,
  Lock,
  MessageSquare,
  Upload,
  FileText,
  Check,
  X,
  Key,
  Server,
  Flame,
  Eye,
  EyeOff,
  Users,
  MessageSquareCode as MessageSquareLock,
} from "lucide-react"
import { useState } from "react"
import React from "react"

// CHANGE: Completely rebuilt background with military operation strings, proper redaction bar (in front of text), and pixel-shred effect
function MilitaryCoordinateBackground() {
  const [snippets, setSnippets] = React.useState<
    Array<{
      id: number
      text: string
      x: number
      y: number
      phase: "fadein" | "visible" | "redacting" | "shredding" | "done"
      phaseProgress: number
      particles?: Array<{ id: number; x: number; y: number; size: number }>
    }>
  >([])
  const [isMobile, setIsMobile] = React.useState(false)

  const nextIdRef = React.useRef(0)
  const lastShownRef = React.useRef<string[]>([])
  const nextTypeRef = React.useRef<"operation" | "coordinate">("operation")

  const operationNames = React.useMemo(
    () => [
      // US Operations - Real Historical WWII
      "OPERATION OVERLORD",
      "OPERATION NEPTUNE",
      "OPERATION MARKET GARDEN",
      "OPERATION TORCH",
      "OPERATION HUSKY",
      "OPERATION DRAGOON",
      "OPERATION COBRA",
      "OPERATION VARSITY",
      "OPERATION AVALANCHE",
      "OPERATION SHINGLE",
      "OPERATION CARTWHEEL",
      "OPERATION FLINTLOCK",
      "OPERATION FORAGER",
      "OPERATION ICEBERG",
      "OPERATION DOWNFALL",
      "OPERATION OLYMPIC",
      "OPERATION CORONET",
      // US Operations - Korea & Vietnam
      "OPERATION CHROMITE",
      "OPERATION RIPPER",
      "OPERATION KILLER",
      "OPERATION THUNDERBOLT",
      "OPERATION ROUNDUP",
      "OPERATION PILEDRIVER",
      "OPERATION ROLLING THUNDER",
      "OPERATION LINEBACKER",
      "OPERATION LINEBACKER II",
      "OPERATION ARC LIGHT",
      "OPERATION MENU",
      "OPERATION BABYLIFT",
      "OPERATION FREQUENT WIND",
      "OPERATION HOMECOMING",
      "OPERATION RANCH HAND",
      "OPERATION CEDAR FALLS",
      "OPERATION JUNCTION CITY",
      "OPERATION HARVEST MOON",
      "OPERATION STARLIGHT",
      "OPERATION MASHER",
      "OPERATION ATTLEBORO",
      "OPERATION PAUL REVERE",
      "OPERATION DEWEY CANYON",
      "OPERATION LAM SON",
      // US Operations - Gulf War & 90s
      "OPERATION DESERT STORM",
      "OPERATION DESERT SHIELD",
      "OPERATION DESERT SABRE",
      "OPERATION DESERT FOX",
      "OPERATION PROVIDE COMFORT",
      "OPERATION SOUTHERN WATCH",
      "OPERATION NORTHERN WATCH",
      "OPERATION EAGLE CLAW",
      "OPERATION URGENT FURY",
      "OPERATION JUST CAUSE",
      "OPERATION PRAYING MANTIS",
      "OPERATION EL DORADO CANYON",
      "OPERATION RESTORE HOPE",
      "OPERATION GOTHIC SERPENT",
      "OPERATION UPHOLD DEMOCRACY",
      "OPERATION ALLIED FORCE",
      "OPERATION NOBLE ANVIL",
      "OPERATION DELIBERATE FORCE",
      // US Operations - War on Terror
      "OPERATION ENDURING FREEDOM",
      "OPERATION IRAQI FREEDOM",
      "OPERATION NEW DAWN",
      "OPERATION INHERENT RESOLVE",
      "OPERATION FREEDOM SENTINEL",
      "OPERATION ANACONDA",
      "OPERATION RED DAWN",
      "OPERATION PHANTOM FURY",
      "OPERATION VIGILANT RESOLVE",
      "OPERATION STEEL CURTAIN",
      "OPERATION IRON HAMMER",
      "OPERATION THUNDER RUN",
      "OPERATION MOUNTAIN THRUST",
      "OPERATION MOUNTAIN LION",
      "OPERATION MEDUSA",
      "OPERATION MOSHTARAK",
      "OPERATION DRAGON STRIKE",
      "OPERATION HAMMER DOWN",
      "OPERATION ROCK AVALANCHE",
      "OPERATION VALIANT STRIKE",
      "OPERATION IRAQI FREEDOM",
      "OPERATION ARROWHEAD RIPPER",
      "OPERATION PHANTOM PHOENIX",
      "OPERATION PHANTOM STRIKE",
      "OPERATION PHANTOM THUNDER",
      // US Operations - Modern
      "OPERATION ODYSSEY DAWN",
      "OPERATION UNIFIED PROTECTOR",
      "OPERATION ATLANTIC RESOLVE",
      "OPERATION TOMODACHI",
      "OPERATION JUNIPER SHIELD",
      "OPERATION SPARTAN SHIELD",
      "OPERATION OCTAVE QUARTZ",
      "OPERATION ALLIES REFUGE",
      "OPERATION PINEAPPLE EXPRESS",
      // US Operations - Fictional but Realistic
      "OPERATION SILENT THUNDER",
      "OPERATION IRON DUSK",
      "OPERATION CRIMSON TIDE",
      "OPERATION DARK WINTER",
      "OPERATION ARCTIC WIND",
      "OPERATION NIGHT HAWK",
      "OPERATION SILVER LANCE",
      "OPERATION BLUE SHIELD",
      "OPERATION GLASS DUNES",
      "OPERATION SILENT HARBOR",
      "OPERATION GRANITE SHADOW",
      "OPERATION EMBER STORM",
      "OPERATION FALCON STRIKE",
      "OPERATION RAPID TRIDENT",
      "OPERATION COLD RESPONSE",
      "OPERATION IRON RESOLVE",
      "OPERATION GOLDEN PHOENIX",
      "OPERATION BLACK ICE",
      "OPERATION RED SABER",
      "OPERATION BLUE THUNDER",
      "OPERATION STEEL RAIN",
      "OPERATION SHADOW HAWK",
      "OPERATION NIGHT FURY",
      "OPERATION WINTER STORM",
      "OPERATION DESERT HAWK",
      "OPERATION MOUNTAIN FURY",
      "OPERATION VALLEY FORGE",
      "OPERATION IRON FIST",
      "OPERATION ROLLING STEEL",
      "OPERATION BURNING SPEAR",
      // Task Forces & Units
      "TASK FORCE RANGER",
      "TASK FORCE DAGGER",
      "TASK FORCE 121",
      "TASK FORCE 145",
      "TASK FORCE 160",
      "TASK FORCE 373",
      "TASK FORCE SWORD",
      "TASK FORCE VIKING",
      "TASK FORCE OLYMPIA",
      "TASK FORCE BAYONET",
      "TASK FORCE ORBITAL",
      "TASK FORCE PHOENIX",
      "TASK FORCE IRON",
      "TASK FORCE FALCON",
      "TASK FORCE THUNDER",
      "TASK FORCE LIBERTY",
      "TASK FORCE DANGER",
      "TASK FORCE BAND OF BROTHERS",
      // Military Designations
      "SIGINT NODE ALPHA",
      "SIGINT NODE BRAVO",
      "SIGINT NODE CHARLIE",
      "SIGINT NODE DELTA",
      "SIGINT NODE ECHO",
      "SIGINT NODE FOXTROT",
      "RECON SECTOR 7",
      "RECON SECTOR 12",
      "RECON SECTOR 19",
      "RECON SECTOR 24",
      "RECON GRID ALPHA",
      "RECON GRID BRAVO",
      "RECON GRID DELTA",
      "RECON GRID ZULU",
      "WATCHTOWER GRID 04",
      "WATCHTOWER GRID 09",
      "WATCHTOWER GRID 17",
      "WATCHTOWER GRID 23",
      "FIREBASE PHOENIX",
      "FIREBASE CONDOR",
      "FIREBASE EAGLE",
      "FIREBASE RIPCORD",
      "FIREBASE MARY ANN",
      "FIREBASE BASTOGNE",
      "OUTPOST VALOR",
      "OUTPOST KEATING",
      "OUTPOST RESTREPO",
      "OUTPOST BARI ALI",
      "CHECKPOINT ALPHA",
      "CHECKPOINT BRAVO",
      "CHECKPOINT CHARLIE",
      "CHECKPOINT DELTA",
      "ZULU CORRIDOR ACTIVE",
      "ECHO BASE ONLINE",
      "COMMAND POST FORWARD",
      "FORWARD OPERATING BASE",
      "FOB SALERNO",
      "FOB CHAPMAN",
      "FOB SHANK",
      "FOB FENTY",
    ],
    [],
  )

  const coordinates = React.useMemo(
    () => [
      // North America
      "38.9072°N / 77.0369°W", // Washington DC
      "40.7128°N / 74.0060°W", // New York
      "37.7749°N / 122.4194°W", // San Francisco
      "34.0522°N / 118.2437°W", // Los Angeles
      "47.6062°N / 122.3321°W", // Seattle
      "25.7617°N / 80.1918°W", // Miami
      "36.1699°N / 115.1398°W", // Las Vegas
      "41.8781°N / 87.6298°W", // Chicago
      "29.7604°N / 95.3698°W", // Houston
      "33.4484°N / 112.0740°W", // Phoenix
      "39.7392°N / 104.9903°W", // Denver
      "45.4215°N / 75.6972°W", // Ottawa
      "43.6532°N / 79.3832°W", // Toronto
      "49.2827°N / 123.1207°W", // Vancouver
      // Europe
      "51.5074°N / 0.1278°W", // London
      "48.8566°N / 2.3522°E", // Paris
      "52.5200°N / 13.4050°E", // Berlin
      "50.1109°N / 8.6821°E", // Frankfurt
      "48.1351°N / 11.5820°E", // Munich
      "53.5511°N / 9.9937°E", // Hamburg
      "50.9375°N / 6.9603°E", // Cologne
      "52.3676°N / 4.9041°E", // Amsterdam
      "50.8503°N / 4.3517°E", // Brussels
      "46.2044°N / 6.1432°E", // Geneva
      "47.3769°N / 8.5417°E", // Zurich
      "48.2082°N / 16.3738°E", // Vienna
      "50.0755°N / 14.4378°E", // Prague
      "52.2297°N / 21.0122°E", // Warsaw
      "59.3293°N / 18.0686°E", // Stockholm
      "59.9139°N / 10.7522°E", // Oslo
      "55.6761°N / 12.5683°E", // Copenhagen
      "60.1699°N / 24.9384°E", // Helsinki
      "41.9028°N / 12.4964°E", // Rome
      "45.4642°N / 9.1900°E", // Milan
      "41.3851°N / 2.1734°E", // Barcelona
      "40.4168°N / 3.7038°W", // Madrid
      "38.7223°N / 9.1393°W", // Lisbon
      // Middle East
      "32.109°N / 34.855°E", // Tel Aviv
      "31.7683°N / 35.2137°E", // Jerusalem
      "29.979°N / 31.134°E", // Cairo
      "25.2769°N / 55.2962°E", // Dubai
      "24.4539°N / 54.3773°E", // Abu Dhabi
      "26.2285°N / 50.5860°E", // Manama
      "25.2854°N / 51.5310°E", // Doha
      "23.4241°N / 53.8478°E", // UAE
      "33.8886°N / 35.4955°E", // Beirut
      "33.5138°N / 36.2765°E", // Damascus
      "36.1910°N / 37.1343°E", // Aleppo
      "33.3152°N / 44.3661°E", // Baghdad
      "34.553°N / 43.486°E", // Tikrit
      "36.3350°N / 43.1189°E", // Mosul
      // Asia Pacific
      "35.6895°N / 139.6917°E", // Tokyo
      "37.5665°N / 126.9780°E", // Seoul
      "39.9042°N / 116.4074°E", // Beijing
      "31.2304°N / 121.4737°E", // Shanghai
      "22.3193°N / 114.1694°E", // Hong Kong
      "1.3521°N / 103.8198°E", // Singapore
      "13.7563°N / 100.5018°E", // Bangkok
      "21.0278°N / 105.8342°E", // Hanoi
      "10.8231°N / 106.6297°E", // Ho Chi Minh
      "14.5995°N / 120.9842°E", // Manila
      "35.1796°N / 136.9066°E", // Nagoya
      "34.6937°N / 135.5023°E", // Osaka
      // Russia & Central Asia
      "55.7558°N / 37.6173°E", // Moscow
      "59.9343°N / 30.3351°E", // St Petersburg
      "43.1155°N / 131.8855°E", // Vladivostok
      "55.0084°N / 82.9357°E", // Novosibirsk
      "51.1694°N / 71.4491°E", // Astana
      "41.2995°N / 69.2401°E", // Tashkent
      // Turkey & Surrounding
      "41.0082°N / 28.9784°E", // Istanbul
      "39.9334°N / 32.8597°E", // Ankara
      "38.4237°N / 27.1428°E", // Izmir
      // Africa
      "33.5731°N / 7.5898°W", // Casablanca
      "36.8065°N / 10.1815°E", // Tunis
      "36.7538°N / 3.0588°E", // Algiers
      "32.8872°N / 13.1913°E", // Tripoli
      "15.5007°N / 32.5599°E", // Khartoum
      "9.1450°N / 40.4897°E", // Addis Ababa
      "1.2921°S / 36.8219°E", // Nairobi
      "6.5244°N / 3.3792°E", // Lagos
      // Oceania
      "33.8688°S / 151.2093°E", // Sydney
      "37.8136°S / 144.9631°E", // Melbourne
      "27.4698°S / 153.0251°E", // Brisbane
      "31.9505°S / 115.8605°E", // Perth
      "41.2865°S / 174.7762°E", // Wellington
      "36.8485°S / 174.7633°E", // Auckland
      // South America
      "23.5505°S / 46.6333°W", // Sao Paulo
      "22.9068°S / 43.1729°W", // Rio de Janeiro
      "34.6037°S / 58.3816°W", // Buenos Aires
      "33.4489°S / 70.6693°W", // Santiago
      "12.0464°S / 77.0428°W", // Lima
      "4.7110°N / 74.0721°W", // Bogota
      "10.4806°N / 66.9036°W", // Caracas
      // Military Bases & Strategic Locations
      "51.4775°N / 0.4614°W", // RAF Northolt
      "51.8860°N / 0.5507°W", // RAF Menwith Hill
      "52.3606°N / 0.4886°W", // RAF Lakenheath
      "38.7183°N / 104.1864°W", // NORAD
      "36.2356°N / 115.0510°W", // Nellis AFB
      "35.0494°N / 118.1517°W", // Edwards AFB
      "32.8140°N / 117.1351°W", // MCAS Miramar
      "36.9489°N / 76.2897°W", // Norfolk Naval
      "21.4601°N / 158.0072°W", // Pearl Harbor
      "26.0836°N / 127.7667°E", // Okinawa
      "35.4540°N / 139.3472°E", // Yokosuka
      "49.0169°N / 2.5452°E", // Ramstein
      "71.2906°N / 156.7886°W", // Barrow Alaska
      "64.1466°N / 21.9426°W", // Reykjavik
      "78.2311°N / 15.6471°E", // Svalbard
      "77.8500°S / 166.6667°E", // McMurdo
    ],
    [],
  )

  const getRandomText = React.useCallback(() => {
    const useOperation = nextTypeRef.current === "operation"
    const pool = useOperation ? operationNames : coordinates
    nextTypeRef.current = useOperation ? "coordinate" : "operation"

    // Filter out recently shown texts
    const available = pool.filter((t) => !lastShownRef.current.includes(t))
    const selected =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : pool[Math.floor(Math.random() * pool.length)]

    // Track last 8 shown to prevent repeats
    lastShownRef.current = [...lastShownRef.current.slice(-7), selected]
    return selected
  }, [operationNames, coordinates])

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  React.useEffect(() => {
    if (isMobile) return

    const maxSnippets = 4

    // Helper to check if position overlaps with existing snippets
    const hasCollision = (x: number, y: number, existingSnippets: typeof snippets) => {
      const minDistance = 15 // Minimum distance between snippets in percent
      return existingSnippets.some((s) => {
        const dx = Math.abs(s.x - x)
        const dy = Math.abs(s.y - y)
        return dx < minDistance && dy < minDistance
      })
    }

    // Helper to generate position around periphery (avoid center where hero text is)
    const generatePeripheryPosition = (existingSnippets: typeof snippets, maxAttempts = 10) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const edge = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
        let x = 0,
          y = 0

        switch (edge) {
          case 0: // top strip only
            x = 5 + Math.random() * 90
            y = 3 + Math.random() * 8
            break
          case 1: // right strip only
            x = 82 + Math.random() * 15
            y = 20 + Math.random() * 60
            break
          case 2: // bottom strip only
            x = 5 + Math.random() * 90
            y = 88 + Math.random() * 10
            break
          case 3: // left strip only
            x = 2 + Math.random() * 12
            y = 20 + Math.random() * 60
            break
        }

        // Check for collision
        if (!hasCollision(x, y, existingSnippets)) {
          return { x, y }
        }
      }

      // Fallback: return a position even if there's potential overlap
      const edge = Math.floor(Math.random() * 4)
      switch (edge) {
        case 0:
          return { x: 5 + Math.random() * 90, y: 3 + Math.random() * 8 }
        case 1:
          return { x: 82 + Math.random() * 15, y: 20 + Math.random() * 60 }
        case 2:
          return { x: 5 + Math.random() * 90, y: 88 + Math.random() * 10 }
        default:
          return { x: 2 + Math.random() * 12, y: 20 + Math.random() * 60 }
      }
    }

    const initialSnippets: typeof snippets = []
    const phases: Array<"fadein" | "visible" | "redacting"> = ["visible", "visible", "fadein", "fadein"]

    for (let i = 0; i < 4; i++) {
      const pos = generatePeripheryPosition(initialSnippets)
      initialSnippets.push({
        id: nextIdRef.current++,
        text: getRandomText(),
        x: pos.x,
        y: pos.y,
        phase: phases[i],
        phaseProgress: phases[i] === "visible" ? Math.random() * 0.5 : Math.random() * 0.8, // Stagger progress
      })
    }
    setSnippets(initialSnippets)

    const interval = setInterval(() => {
      setSnippets((prev) => {
        // Update existing snippets through their lifecycle
        const updated = prev
          .map((s) => {
            // Slower progression for more calm feel
            const progressIncrement =
              s.phase === "fadein" ? 0.05 : s.phase === "visible" ? 0.008 : s.phase === "redacting" ? 0.025 : 0.015

            const newProgress = s.phaseProgress + progressIncrement

            if (s.phase === "fadein" && newProgress >= 1) {
              return { ...s, phase: "visible" as const, phaseProgress: 0 }
            }
            if (s.phase === "visible" && newProgress >= 1) {
              return { ...s, phase: "redacting" as const, phaseProgress: 0 }
            }
            if (s.phase === "redacting" && newProgress >= 1) {
              // Generate particles for pixel-shred effect
              const particles = Array.from({ length: 12 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 2 + Math.random() * 4,
              }))
              return { ...s, phase: "shredding" as const, phaseProgress: 0, particles }
            }
            if (s.phase === "shredding" && newProgress >= 1) {
              return { ...s, phase: "done" as const }
            }
            return { ...s, phaseProgress: newProgress }
          })
          .filter((s) => s.phase !== "done")

        // Spawn new snippet if under max - with collision check
        if (updated.length < maxSnippets && Math.random() > 0.7) {
          const pos = generatePeripheryPosition(updated)
          updated.push({
            id: nextIdRef.current++,
            text: getRandomText(),
            x: pos.x,
            y: pos.y,
            phase: "fadein",
            phaseProgress: 0,
          })
        }

        return updated
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isMobile, getRandomText])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Radial grid - stronger at edges, fades toward center */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D1D5DB 1px, transparent 1px),
            linear-gradient(to bottom, #D1D5DB 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.25,
          maskImage:
            "radial-gradient(ellipse 70% 70% at center, transparent 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at center, transparent 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Layer 2 & 3: Floating operation strings with redaction bar + pixel-shred */}
      {!isMobile &&
        snippets.map((snippet) => {
          let textOpacity = 0
          let barOpacity = 0
          let barWidth = 0

          if (snippet.phase === "fadein") {
            textOpacity = 0.3 * snippet.phaseProgress
          } else if (snippet.phase === "visible") {
            textOpacity = 0.3
          } else if (snippet.phase === "redacting") {
            // Text visible until bar fully covers it
            textOpacity = snippet.phaseProgress < 1 ? 0.3 : 0
            barOpacity = 0.2
            barWidth = snippet.phaseProgress * 100
          } else if (snippet.phase === "shredding") {
            textOpacity = 0 // text stays hidden
            barOpacity = 0 // bar is now shredded
          }

          return (
            <div
              key={snippet.id}
              className="absolute"
              style={{
                left: `${snippet.x}%`,
                top: `${snippet.y}%`,
              }}
            >
              {/* Layer 2: Operation text */}
              <div
                className="font-mono text-xs whitespace-nowrap select-none relative"
                style={{
                  color: "#9CA3AF",
                  opacity: textOpacity,
                }}
              >
                {snippet.text}
              </div>

              {snippet.phase === "redacting" && (
                <div
                  className="absolute top-0 rounded"
                  style={{
                    left: "-8px",
                    width: `calc(${barWidth}% + 16px)`,
                    height: "100%",
                    backgroundColor: "#6B7280",
                    opacity: barOpacity,
                    zIndex: 10,
                  }}
                />
              )}

              {/* Layer 3b: Pixel-shred particles */}
              {snippet.phase === "shredding" &&
                snippet.particles?.map((particle) => {
                  const drift = snippet.phaseProgress
                  const fadeOut = 1 - snippet.phaseProgress

                  return (
                    <div
                      key={particle.id}
                      className="absolute rounded-sm"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: "#6B7280",
                        opacity: fadeOut * 0.18,
                        transform: `translate(${drift * 10}px, ${-drift * 14}px)`,
                      }}
                    />
                  )
                })}
            </div>
          )
        })}
    </div>
  )
}

// CHANGE: New tabbed comparison data structure with detailed per-service comparisons
const COMPARISON_TABS = [
  { id: "signal", label: "Signal" },
  { id: "session", label: "Session" },
  { id: "simplex", label: "SimpleX" },
  { id: "telegram", label: "Telegram" },
  { id: "whatsapp", label: "WhatsApp" },
]

const COMPARISON_FEATURES = [
  { key: "e2e", label: "End-to-end encryption by default" },
  { key: "requiresAccount", label: "Requires account / phone number" },
  { key: "serverSeesContent", label: "Server sees message content" },
  { key: "serverStoresMetadata", label: "Server stores metadata / identifiers" },
  { key: "keyOnDevice", label: "Key stays only on device / in browser" },
  { key: "anonymousAccess", label: "Anonymous access (no signup)" },
  { key: "selfDestructRooms", label: "Self-destructing rooms / sessions" },
  { key: "oneTimeMessages", label: "One-time self-destruct messages" },
  { key: "oneTimeFileDrop", label: "One-time encrypted file drop" },
  { key: "messagesStoredAfterClose", label: "Messages stored after you close the app" },
  { key: "browserNative", label: "Browser-native, no install required" },
  { key: "minimizeMetadata", label: "Designed to minimize metadata" },
]

type ComparisonValue = {
  zkchat: string
  other: string
}

const COMPARISON_DATA: Record<string, Record<string, ComparisonValue>> = {
  signal: {
    e2e: { zkchat: "Yes (AES-256-GCM)", other: "Yes (Signal Protocol)" },
    requiresAccount: { zkchat: "No", other: "Phone required" },
    serverSeesContent: { zkchat: "No (mathematically impossible)", other: "No" },
    serverStoresMetadata: { zkchat: "No", other: "Yes (phone, contacts)" },
    keyOnDevice: { zkchat: "Yes (URL fragment, never sent)", other: "Yes" },
    anonymousAccess: { zkchat: "Yes", other: "No" },
    selfDestructRooms: { zkchat: "Yes (auto-burn when empty)", other: "Partial (disappearing messages)" },
    oneTimeMessages: { zkchat: "Yes", other: "No" },
    oneTimeFileDrop: { zkchat: "Yes", other: "No" },
    messagesStoredAfterClose: { zkchat: "No (memory only)", other: "Yes, until deleted" },
    browserNative: { zkchat: "Yes", other: "No (app required)" },
    minimizeMetadata: { zkchat: "Yes (zero metadata by design)", other: "Partial" },
  },
  session: {
    e2e: { zkchat: "Yes (AES-256-GCM)", other: "Yes (Session Protocol)" },
    requiresAccount: { zkchat: "No", other: "Session ID required" },
    serverSeesContent: { zkchat: "No (mathematically impossible)", other: "No" },
    serverStoresMetadata: { zkchat: "No", other: "Minimal (onion routing)" },
    keyOnDevice: { zkchat: "Yes (URL fragment, never sent)", other: "Yes" },
    anonymousAccess: { zkchat: "Yes", other: "Partial (ID generated)" },
    selfDestructRooms: { zkchat: "Yes (auto-burn when empty)", other: "No" },
    oneTimeMessages: { zkchat: "Yes", other: "No" },
    oneTimeFileDrop: { zkchat: "Yes", other: "No" },
    messagesStoredAfterClose: { zkchat: "No (memory only)", other: "Yes" },
    browserNative: { zkchat: "Yes", other: "No (app required)" },
    minimizeMetadata: { zkchat: "Yes (zero metadata by design)", other: "Yes (decentralized)" },
  },
  simplex: {
    e2e: { zkchat: "Yes (AES-256-GCM)", other: "Yes (double ratchet)" },
    requiresAccount: { zkchat: "No", other: "No (address-based)" },
    serverSeesContent: { zkchat: "No (mathematically impossible)", other: "No" },
    serverStoresMetadata: { zkchat: "No", other: "Minimal" },
    keyOnDevice: { zkchat: "Yes (URL fragment, never sent)", other: "Yes" },
    anonymousAccess: { zkchat: "Yes", other: "Partial" },
    selfDestructRooms: { zkchat: "Yes (auto-burn when empty)", other: "No" },
    oneTimeMessages: { zkchat: "Yes", other: "No" },
    oneTimeFileDrop: { zkchat: "Yes", other: "No" },
    messagesStoredAfterClose: { zkchat: "No (memory only)", other: "Yes" },
    browserNative: { zkchat: "Yes", other: "No (app required)" },
    minimizeMetadata: { zkchat: "Yes (zero metadata by design)", other: "Yes" },
  },
  telegram: {
    e2e: { zkchat: "Yes (AES-256-GCM)", other: "Opt-in only (Secret Chats)" },
    requiresAccount: { zkchat: "No", other: "Phone required" },
    serverSeesContent: { zkchat: "No (mathematically impossible)", other: "Yes (regular chats)" },
    serverStoresMetadata: { zkchat: "No", other: "Yes (extensive)" },
    keyOnDevice: { zkchat: "Yes (URL fragment, never sent)", other: "No (cloud-based)" },
    anonymousAccess: { zkchat: "Yes", other: "No" },
    selfDestructRooms: { zkchat: "Yes (auto-burn when empty)", other: "Partial (Secret Chats only)" },
    oneTimeMessages: { zkchat: "Yes", other: "No" },
    oneTimeFileDrop: { zkchat: "Yes", other: "No" },
    messagesStoredAfterClose: { zkchat: "No (memory only)", other: "Yes (cloud sync)" },
    browserNative: { zkchat: "Yes", other: "Yes (web app)" },
    minimizeMetadata: { zkchat: "Yes (zero metadata by design)", other: "No" },
  },
  whatsapp: {
    e2e: { zkchat: "Yes (AES-256-GCM)", other: "Yes (Signal Protocol)" },
    requiresAccount: { zkchat: "No", other: "Phone required" },
    serverSeesContent: { zkchat: "No (mathematically impossible)", other: "No" },
    serverStoresMetadata: { zkchat: "No", other: "Yes (metadata)" },
    keyOnDevice: { zkchat: "Yes (URL fragment, never sent)", other: "Yes" },
    anonymousAccess: { zkchat: "Yes", other: "No" },
    selfDestructRooms: { zkchat: "Yes (auto-burn when empty)", other: "Partial (disappearing messages)" },
    oneTimeMessages: { zkchat: "Yes", other: "No" },
    oneTimeFileDrop: { zkchat: "Yes", other: "No" },
    messagesStoredAfterClose: { zkchat: "No (memory only)", other: "Yes, until deleted" },
    browserNative: { zkchat: "Yes", other: "Partial (requires phone link)" },
    minimizeMetadata: { zkchat: "Yes (zero metadata by design)", other: "No (Meta ownership)" },
  },
}

const FAQ_ITEMS = [
  {
    question: "Is zkChat more private than Signal or Session?",
    answer:
      "For ephemeral communication, yes. Signal and Session require accounts and store metadata. zkChat requires nothing—no phone number, no email, no identity. The encryption key never touches our servers (it stays in the URL fragment), rooms auto-destruct when empty, and we maintain zero logs. For persistent messaging with contacts, Signal is excellent. For anonymous, disposable, zero-trace communication, zkChat is purpose-built.",
  },
  {
    question: "Can my ISP, employer, or government read my messages?",
    answer:
      "No. Messages are encrypted in your browser with AES-256-GCM before transmission. Your ISP, employer, or any network observer sees only encrypted ciphertext traveling to our relay. They cannot see message content, who you're talking to (participants are anonymous), or the encryption key (it's in the URL fragment, never transmitted). They can see that you connected to zkChat—but nothing about what you're doing.",
  },
  {
    question: "What if someone hacks the zkChat server?",
    answer:
      "They would find nothing useful. Our server only relays encrypted blobs—random bytes it cannot decrypt. We don't have your encryption keys (they're in URL fragments your browser never sends us). We don't store message history. Active rooms exist only in memory and vanish when connections close. A full server compromise yields zero plaintext, zero keys, zero message content.",
  },
  {
    question: "What metadata do you store?",
    answer:
      "Essentially none. We don't log IP addresses long-term. We don't track who creates rooms or who joins them. We don't store message timestamps or sender identities. The server knows only that a room with a random ID exists and how many active WebSocket connections it has. When everyone leaves, even that information is deleted. We cannot identify users or correlate activity.",
  },
  {
    question: "Why don't you require accounts or phone numbers?",
    answer:
      "Because accounts create attack surfaces. A database of accounts can be breached, subpoenaed, or analyzed. Phone numbers link to real identities. By requiring nothing, we have nothing to protect, nothing to hand over, and nothing that ties communication to real people. Your identity is simply 'someone with this link'—and when the room closes, even that ephemeral identity vanishes.",
  },
  {
    question: "What happens when I close the tab?",
    answer:
      "Your local message history (which only existed in browser memory) is gone. You disconnect from the room. If you were the last participant, the room is destroyed. If others remain, you simply leave and they can continue. Your messages remain visible to others until the room closes—but only because they're decrypted in their browsers using the shared key. Nothing persists on our servers.",
  },
  {
    question: "How do one-time messages work?",
    answer:
      "You write a message, your browser encrypts it with AES-256-GCM, and uploads only the ciphertext. We return a link with the decryption key in the URL fragment (#key=...). When someone opens that link, we serve the ciphertext once and immediately delete it. The recipient's browser decrypts locally. The message cannot be read again—it's cryptographically destroyed after first view.",
  },
  {
    question: "How does encrypted file sharing work?",
    answer:
      "Identical to one-time messages. Your browser encrypts the file with AES-256-GCM before upload. We store only encrypted bytes—no filename, no file type, no metadata. The decryption key and file details are embedded in the URL fragment. After one download (or 24 hours), the encrypted blob is permanently deleted. We never see your file contents.",
  },
  {
    question: "Are you using AES-256-GCM correctly?",
    answer:
      "Yes. We use the Web Crypto API for all encryption operations. Each message/file gets a unique random IV. We use 256-bit keys generated via secure random. GCM mode provides both confidentiality and authenticity (tamper detection). Our implementation follows standard cryptographic best practices—no homebrew crypto, no weak algorithms, no shortcuts.",
  },
  {
    question: "Can I use zkChat for journalism, legal, or whistleblowing work?",
    answer:
      "zkChat provides strong technical privacy guarantees suitable for sensitive communication. However, no tool is perfect. Consider your threat model: endpoint security matters (compromised devices defeat encryption), operational security matters (don't reveal your identity in messages), and network analysis is still possible (observers can see you connected to zkChat). For high-risk scenarios, combine zkChat with Tor, VPNs, and careful operational practices.",
  },
  {
    question: "Do you log IP addresses?",
    answer:
      "Standard server logs may briefly contain IP addresses for operational reasons (debugging, abuse prevention), but we don't store them long-term, don't correlate them with room activity, and don't use them for tracking. We have no database mapping IPs to users or messages. For maximum IP privacy, access zkChat through Tor or a trusted VPN.",
  },
]

export default function LandingPage() {
  // CHANGE: Remove startSecureChat function and loading state - no longer needed
  const [activeTab, setActiveTab] = useState("signal")
  const router = useRouter() // ADDED: Declare router variable

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center p-4 py-20 overflow-hidden">
        <MilitaryCoordinateBackground />
        <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>AES-256-GCM Encryption</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight text-balance leading-tight">
              Military-Grade
              <br />
              <span className="text-muted-foreground">Privacy For Everyday.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
              Ephemeral end-to-end encrypted chat, file-drop, and one-time messages. No accounts. No metadata. No logs.
              No identities. <strong className="text-foreground">Everything burns the moment you leave.</strong>
            </p>
          </div>

          {/* CHANGE: Optimized 3-tool links - smaller, more compact, pill-style for mobile */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <a
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background/60 backdrop-blur-sm hover:bg-secondary hover:border-foreground/20 transition-all text-sm font-medium text-foreground"
            >
              <Users className="w-4 h-4" />
              Chat
            </a>

            <a
              href="/otm"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background/60 backdrop-blur-sm hover:bg-secondary hover:border-foreground/20 transition-all text-sm font-medium text-foreground"
            >
              <MessageSquareLock className="w-4 h-4" />
              Pastebin
            </a>

            <a
              href="/file"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background/60 backdrop-blur-sm hover:bg-secondary hover:border-foreground/20 transition-all text-sm font-medium text-foreground"
            >
              <Upload className="w-4 h-4" />
              File Drop
            </a>
          </div>

          {/* CHANGE: Replaced status indicators with animated scroll-down icon */}
          <div className="pt-12 flex justify-center">
            <button
              onClick={() => {
                document.getElementById("why-zkchat")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="flex flex-col items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors group"
              aria-label="Scroll down to learn more"
            >
              <span className="text-xs uppercase tracking-widest">Learn more</span>
              <svg
                className="w-5 h-5 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Why zkChat Section */}
      <section id="why-zkchat" className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">
              Why zkChat is More Private Than &ldquo;Private Messengers&rdquo;
            </h2>
          </div>

          <div className="grid gap-6">
            <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary shrink-0">
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">AES-256-GCM: The Gold Standard</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    zkChat uses <strong className="text-foreground">AES-256-GCM</strong>, the same symmetric encryption
                    primitive used in banking infrastructure, military and government-grade secure storage, and TLS
                    connections protecting financial data worldwide.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary shrink-0">
                  <Lock className="w-5 h-5 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Encryption Happens in Your Browser</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    All encryption and decryption happens{" "}
                    <strong className="text-foreground">entirely in your browser</strong> before any data leaves your
                    device. The encryption key lives in the URL fragment (
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground text-xs">#key=...</code>), which
                    browsers <strong className="text-foreground">never send to servers</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary shrink-0">
                  <Server className="w-5 h-5 text-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">We See Only Random Ciphertext</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The relay server, CDNs, proxies, and infrastructure providers see{" "}
                    <strong className="text-foreground">only random ciphertext</strong>—never keys or plaintext. Even if
                    compelled or compromised, we cannot decrypt what we don&apos;t have the keys for.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-secondary shrink-0">
                    <Flame className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">Everything Burns</h3>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 mt-1">•</span>
                        <span>Rooms auto-burn when all participants leave</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 mt-1">•</span>
                        <span>One-time messages burn on first read</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 mt-1">•</span>
                        <span>File drops burn on download or after TTL</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-secondary shrink-0">
                    <EyeOff className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">True Anonymity</h3>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 mt-1">•</span>
                        <span>No accounts, no phone numbers, no emails</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 mt-1">•</span>
                        <span>No analytics, no tracking, no profiling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-foreground/40 mt-1">•</span>
                        <span>zkChat does not know who you are</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE: Replace Comparison Table with Tabbed Comparison */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">
              zkChat vs Other &quot;Private&quot; Messengers
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A factual comparison of privacy features. We keep it honest.
            </p>
          </div>

          {/* Segmented Control / Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {COMPARISON_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                zkChat vs {tab.label}
              </button>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-background rounded-2xl border border-border overflow-hidden">
            <h3 className="sr-only">
              zkChat vs {COMPARISON_TABS.find((t) => t.id === activeTab)?.label}: Privacy Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th scope="col" className="text-left py-4 px-4 font-medium text-foreground">
                      Feature
                    </th>
                    <th scope="col" className="text-left py-4 px-4 font-medium text-foreground w-[200px]">
                      zkChat
                    </th>
                    <th scope="col" className="text-left py-4 px-4 font-medium text-foreground w-[200px]">
                      {COMPARISON_TABS.find((t) => t.id === activeTab)?.label}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feature, index) => {
                    const data = COMPARISON_DATA[activeTab][feature.key]
                    return (
                      <tr
                        key={feature.key}
                        className={`border-b border-border last:border-b-0 ${index % 2 === 0 ? "" : "bg-secondary/10"}`}
                      >
                        <th scope="row" className="text-left py-3 px-4 font-normal text-muted-foreground">
                          {feature.label}
                        </th>
                        <td className="py-3 px-4">
                          <ComparisonValueCell value={data.zkchat} isZkChat />
                        </td>
                        <td className="py-3 px-4">
                          <ComparisonValueCell value={data.other} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-lg mx-auto">
            This comparison is based on publicly available information and may not reflect recent updates. We encourage
            you to verify claims independently.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">
              How zkChat Works (Without Trusting Us)
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Cryptographic guarantees that don&apos;t require faith in our good intentions.
            </p>
          </div>

          <div className="grid gap-8">
            {/* Block 1: Key stays in browser */}
            <div className="bg-secondary/30 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-foreground text-background">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Key Stays in Your Browser</h3>
              </div>
              <div className="pl-16 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  A <strong className="text-foreground">256-bit key</strong> is generated via Web Crypto API directly in
                  your browser. This key is encoded and placed in the URL{" "}
                  <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground text-xs">#fragment</code>. By
                  design, browsers <strong className="text-foreground">never send</strong> anything after the # to
                  servers or proxies.
                </p>
                <div className="bg-secondary/50 rounded-xl p-4 font-mono text-sm space-y-2">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      Server sees: <code className="text-foreground">/room/abc123</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    <span className="text-muted-foreground/70">
                      Server does NOT see: <code>#key=8f3a9b...</code>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: Server sees only ciphertext */}
            <div className="bg-secondary/30 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-foreground text-background">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Server Sees Only Ciphertext</h3>
              </div>
              <div className="pl-16 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Messages, OTMs, and files are encrypted using <strong className="text-foreground">AES-256-GCM</strong>
                  . The server only relays or stores ciphertext blobs. Even a full server compromise reveals no
                  plaintext and no keys.
                </p>
                <div className="bg-secondary/50 rounded-xl p-4 font-mono text-xs">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-foreground px-2 py-1 bg-secondary rounded">Browser</span>
                    <span className="text-muted-foreground">→ AES-256-GCM →</span>
                    <span className="text-muted-foreground px-2 py-1 bg-secondary/50 rounded">Ciphertext</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground px-2 py-1 bg-secondary/50 rounded">Relay</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground px-2 py-1 bg-secondary/50 rounded">Ciphertext</span>
                    <span className="text-muted-foreground">→ AES-256-GCM →</span>
                    <span className="text-foreground px-2 py-1 bg-secondary rounded">Browser</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 3: Everything self-destructs */}
            <div className="bg-secondary/30 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-foreground text-background">
                  {/* CHANGE: Fixed icon color from text-foreground to text-background so it's visible */}
                  <Flame className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Everything Self-Destructs</h3>
              </div>
              <div className="pl-16 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  No historical log, no archive, no inbox. Privacy isn't a setting—it's the architecture.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <MessageSquare className="w-5 h-5 mx-auto mb-2 text-foreground" />
                    <p className="text-sm font-medium text-foreground">Rooms</p>
                    <p className="text-xs text-muted-foreground">Destroyed when all disconnect</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <FileText className="w-5 h-5 mx-auto mb-2 text-foreground" />
                    <p className="text-sm font-medium text-foreground">OTMs</p>
                    <p className="text-xs text-muted-foreground">Burned on first read</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Upload className="w-5 h-5 mx-auto mb-2 text-foreground" />
                    <p className="text-sm font-medium text-foreground">Files</p>
                    <p className="text-xs text-muted-foreground">Deleted after download or 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Long-Form Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold text-foreground tracking-tight text-center">
            Military-Grade Encryption for Real-World Privacy
          </h2>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              In an era where every message, file, and conversation leaves a permanent digital footprint, zkChat offers
              something radically different:{" "}
              <strong className="text-foreground">ephemeral, zero-knowledge communication</strong> built on
              military-grade AES-256 encryption. This isn't security theater—it's cryptographic architecture designed
              from the ground up for real-world privacy.
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-4">
              The Problem with &ldquo;Private&rdquo; Messengers
            </h3>
            <p className="leading-relaxed">
              Most messaging platforms claim end-to-end encryption, but encryption is only part of the story.{" "}
              <strong className="text-foreground">Metadata</strong>—who you talk to, when, how often, from where—often
              reveals as much as message content. Traditional messengers require accounts linked to phone numbers or
              emails, creating permanent identity records. They store message history, contact graphs, and behavioral
              data on servers you don&apos;t control. Even with encrypted content, this metadata enables{" "}
              <strong className="text-foreground">
                surveillance capitalism, traffic correlation attacks, and legal compulsion
              </strong>
              .
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-4">zkChat's Zero-Knowledge Architecture</h3>
            <p className="leading-relaxed">
              zkChat takes a fundamentally different approach. Every chat room, one-time message, and file drop uses{" "}
              <strong className="text-foreground">AES-256-GCM encryption</strong> performed entirely in your browser.
              The encryption key is generated locally and embedded in the URL fragment—the part after the # that
              browsers never transmit to servers. Our relay sees only random ciphertext bytes. We cannot decrypt your
              messages because we never possess the keys.
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-4">Anonymous by Architecture, Not Policy</h3>
            <p className="leading-relaxed">
              Unlike services that promise not to log your data (promises that can change or be legally compelled),
              zkChat's privacy guarantees are <strong className="text-foreground">architectural</strong>. We require no
              accounts, no phone numbers, no emails. There is no user database to breach or subpoena. Rooms exist only
              in memory and vanish when participants leave. One-time messages are cryptographically destroyed after
              first read. This isn't a policy decision—it's how the system is built.
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-4">Real Threats, Real Protection</h3>
            <p className="leading-relaxed">
              Consider the threats that matter: <strong className="text-foreground">corporate data harvesting</strong>{" "}
              (we collect nothing to harvest), <strong className="text-foreground">government surveillance</strong> (we
              have no decryption capability to provide), <strong className="text-foreground">server breaches</strong>{" "}
              (attackers would find only meaningless ciphertext),{" "}
              <strong className="text-foreground">network observers</strong> (ISPs and employers see only encrypted
              traffic). The only remaining attack vector is endpoint compromise—and no communication tool can protect
              you if your device is already compromised.
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-4">Built for Sensitive Communication</h3>
            <p className="leading-relaxed">
              zkChat is purpose-built for scenarios where privacy is non-negotiable:{" "}
              <strong className="text-foreground">
                journalists protecting sources, legal teams discussing privileged matters, activists organizing under
                repressive regimes, businesses sharing confidential information, or anyone who simply values
                communication that&apos;s nobody&apos;s business but yours
              </strong>
              . Whether you&apos;re sharing a password, coordinating a project, or having a conversation that&apos;s
              nobody&apos;s business but yours, zkChat ensures that when the chat ends, the evidence ends with it.
            </p>

            <p className="leading-relaxed">
              This is what <strong className="text-foreground">privacy-first messaging</strong> actually looks like:
              browser-based encryption, fragment-isolated keys, ephemeral state, and zero-knowledge architecture. Not
              promises—mathematics.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// CHANGE: New comparison value cell component with better visual treatment
function ComparisonValueCell({ value, isZkChat = false }: { value: string; isZkChat?: boolean }) {
  const isPositive = value.toLowerCase().startsWith("yes") || (value.toLowerCase() === "no" && !value.includes("("))
  const isNegative =
    value.toLowerCase().startsWith("no ") ||
    value.toLowerCase().includes("required") ||
    value.toLowerCase().includes("extensive")
  const isPartial =
    value.toLowerCase().startsWith("partial") ||
    value.toLowerCase().startsWith("opt-in") ||
    value.toLowerCase().startsWith("minimal")

  let colorClass = "text-muted-foreground"
  if (isZkChat) {
    if (value.toLowerCase().startsWith("yes") || value.toLowerCase() === "no") {
      colorClass = "text-green-600"
    }
  } else {
    if (isNegative || (value.toLowerCase().includes("yes (") && value.toLowerCase().includes("metadata"))) {
      colorClass = "text-red-500"
    } else if (isPartial) {
      colorClass = "text-amber-600"
    } else if (value.toLowerCase().startsWith("yes") && !value.toLowerCase().includes("until")) {
      colorClass = "text-green-600"
    }
  }

  return <span className={`text-sm ${colorClass}`}>{value}</span>
}

// CHANGE: Keep old ComparisonCell for any remaining uses
function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20">
        <Check className="w-4 h-4 text-green-600" />
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20">
        <X className="w-4 h-4 text-red-500" />
      </div>
    )
  }
  return <span className="text-xs text-muted-foreground">partial</span>
}
