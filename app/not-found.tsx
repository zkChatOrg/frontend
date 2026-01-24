"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Ghost, Home, RotateCcw, Trophy } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function NotFound() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [ghosts, setGhosts] = useState<{ id: number; x: number; y: number; caught: boolean }[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState("")

  const funnyMessages = [
    "404: Page went into witness protection",
    "This page self-destructed. Very on-brand for zkChat.",
    "You found nothing. Congratulations?",
    "The page you seek has been encrypted... forever.",
    "Error 404: Privacy so good, even the page disappeared",
    "This URL has zero knowledge of existing",
    "Page not found. It was probably burned after reading.",
  ]

  const endGameMessages = [
    { min: 0, max: 3, msg: "Are you even trying? The ghosts are laughing at you." },
    { min: 4, max: 7, msg: "Not bad! But the 404 ghost army is unimpressed." },
    { min: 8, max: 12, msg: "Solid effort! You're a semi-professional ghost hunter." },
    { min: 13, max: 17, msg: "Impressive! The ghosts are starting to fear you." },
    { min: 18, max: 99, msg: "LEGENDARY! You are the Ghost Whisperer of 404 pages!" },
  ]

  useEffect(() => {
    setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)])
    const stored = localStorage.getItem("zkChat404HighScore")
    if (stored) setHighScore(Number.parseInt(stored))
  }, [])

  const spawnGhost = useCallback(() => {
    const id = Date.now() + Math.random()
    const x = Math.random() * 80 + 10
    const y = Math.random() * 60 + 20
    setGhosts((prev) => [...prev.filter((g) => !g.caught), { id, x, y, caught: false }])
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawner = setInterval(() => {
      spawnGhost()
    }, 800)

    return () => clearInterval(spawner)
  }, [gameStarted, gameOver, spawnGhost])

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score)
      localStorage.setItem("zkChat404HighScore", score.toString())
    }
  }, [gameOver, score, highScore])

  const catchGhost = (id: number) => {
    setGhosts((prev) => prev.map((g) => (g.id === id ? { ...g, caught: true } : g)))
    setScore((prev) => prev + 1)
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeLeft(15)
    setGhosts([])
  }

  const getEndMessage = () => {
    const result = endGameMessages.find((m) => score >= m.min && score <= m.max)
    return result?.msg || "Nice!"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          {!gameStarted ? (
            <>
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-4 animate-bounce">
                  <Ghost className="w-10 h-10 text-foreground" />
                </div>
                <h1 className="text-7xl font-bold text-foreground tracking-tight">404</h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">{message}</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button
                    size="lg"
                    className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={startGame}
                  className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all bg-transparent"
                >
                  <Ghost className="w-5 h-5 mr-2" />
                  Catch the 404 Ghosts!
                </Button>
              </div>

              {highScore > 0 && (
                <div className="pt-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Your high score: {highScore} ghosts</span>
                </div>
              )}
            </>
          ) : gameOver ? (
            <>
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-4">
                  <Trophy className="w-10 h-10 text-foreground" />
                </div>
                <h1 className="text-5xl font-bold text-foreground tracking-tight">Game Over!</h1>
                <p className="text-3xl font-semibold text-foreground">
                  You caught <span className="text-primary">{score}</span> ghost{score !== 1 ? "s" : ""}!
                </p>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">{getEndMessage()}</p>
                {score >= highScore && score > 0 && (
                  <p className="text-sm text-green-500 font-medium">New High Score!</p>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button
                    size="lg"
                    className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={startGame}
                  className="rounded-full px-8 h-14 text-base font-medium shadow-sm hover:shadow-md transition-all bg-transparent"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-medium">
                  Score: <span className="text-primary font-bold">{score}</span>
                </div>
                <div className="text-lg font-medium">
                  Time:{" "}
                  <span className={`font-bold ${timeLeft <= 5 ? "text-red-500" : "text-primary"}`}>{timeLeft}s</span>
                </div>
              </div>

              <div
                className="relative bg-secondary/50 rounded-xl border border-border overflow-hidden"
                style={{ height: "400px" }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <span className="text-[200px] font-bold">404</span>
                </div>

                {ghosts.map(
                  (ghost) =>
                    !ghost.caught && (
                      <button
                        key={ghost.id}
                        onClick={() => catchGhost(ghost.id)}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 hover:scale-125 cursor-pointer animate-pulse"
                        style={{ left: `${ghost.x}%`, top: `${ghost.y}%` }}
                      >
                        <Ghost className="w-10 h-10 text-foreground hover:text-primary transition-colors" />
                      </button>
                    ),
                )}

                <div className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground text-sm">
                  Click the ghosts before they disappear!
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  setGameStarted(false)
                  setGameOver(false)
                }}
                className="mt-4"
              >
                Quit Game
              </Button>
            </>
          )}

          <div className="pt-6">
            <p className="text-xs text-muted-foreground">Like this page, your messages leave no trace.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
