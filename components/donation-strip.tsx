"use client"

import type React from "react"
import { useState } from "react"
import { SiMonero, SiZcash, SiBitcoin, SiEthereum, SiSolana } from "react-icons/si"

const CRYPTO_ADDRESSES = {
  monero: "44Y6ugZEvP2Wz3QRsjg8QH91vnqWsMuRSZ9Pgatxd7ACKvztr3VCdQAipNU6PRRYG7NHGLd9cmoPnceMuJNoeX36Em7wAeY",
  zcash:
    "u1wd3xx7c8xmckwdvhrszv0k76n7dtxp3x0kv204znjwuvjpyg93he67sx92jctylmq7tkzcc9hk86t7ze80laz68rt3a4xsdsk4tl0359v9dfga9540kl96g72cvqw6vcwkzknj6a7xmppmm6a5zl4xpk4n2njy65a298r46w65v4at2y",
  bitcoin: "bc1q6qgdyu3lwx3w7l42n5ga4utw6pckq7eyrxcmz0",
  ethereum: "0x0060fB9a418C3Af09e3849098cbfAD0a7eC675De",
  solana: "JDqyBsMxz6jypALayp4qvWyPMKuT65d22zjWMQmNM4Ub",
}

function CryptoAddressButton({
  icon: Icon,
  label,
  address,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  address: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-secondary/50 hover:bg-secondary/80 rounded px-2 py-1 transition-colors cursor-pointer"
      title={`Click to copy ${label} address`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate max-w-[120px] sm:max-w-[200px]">{copied ? "Copied!" : address}</span>
    </button>
  )
}

export function DonationStrip() {
  return (
    <div className="w-full border-t border-border bg-secondary/30 mt-16 py-8">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
        <h3 className="text-lg font-medium text-foreground">Support zkChat</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          zkChat stays ad-free, tracker-free and account-free. Donations help cover infrastructure and keep the project
          independent.
        </p>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <CryptoAddressButton icon={SiMonero} label="Monero" address={CRYPTO_ADDRESSES.monero} />
          <CryptoAddressButton icon={SiZcash} label="Zcash" address={CRYPTO_ADDRESSES.zcash} />
          <CryptoAddressButton icon={SiBitcoin} label="Bitcoin" address={CRYPTO_ADDRESSES.bitcoin} />
          <CryptoAddressButton icon={SiEthereum} label="Ethereum" address={CRYPTO_ADDRESSES.ethereum} />
          <CryptoAddressButton icon={SiSolana} label="Solana" address={CRYPTO_ADDRESSES.solana} />
        </div>
      </div>
    </div>
  )
}
