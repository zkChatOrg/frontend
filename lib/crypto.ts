"use client"

/**
 * Generate a cryptographically random encryption key
 */
export function generateEncryptionKey(): string {
  const array = new Uint8Array(32) // 256 bits
  crypto.getRandomValues(array)
  return arrayToBase64Url(array)
}

/**
 * Encrypt a message using AES-GCM
 */
export async function encryptMessage(
  plaintext: string,
  keyBase64: string,
): Promise<{ iv: string; ciphertext: string }> {
  const key = await importKey(keyBase64)
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96 bits for GCM
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data,
  )

  return {
    iv: arrayToBase64Url(iv),
    ciphertext: arrayToBase64Url(new Uint8Array(encrypted)),
  }
}

/**
 * Decrypt a message using AES-GCM
 */
export async function decryptMessage(iv: string, ciphertext: string, keyBase64: string): Promise<string> {
  const key = await importKey(keyBase64)
  const ivArray = base64UrlToArray(iv)
  const ciphertextArray = base64UrlToArray(ciphertext)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivArray,
    },
    key,
    ciphertextArray,
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

/**
 * Encrypt audio bytes using AES-GCM
 */
export async function encryptAudioBytes(plaintextBytes: Uint8Array, keyBase64: string): Promise<Uint8Array> {
  const key = await importKey(keyBase64)
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96 bits for GCM

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    plaintextBytes,
  )

  // Prepend IV to ciphertext for decryption
  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), iv.length)

  return result
}

/**
 * Decrypt audio bytes using AES-GCM
 */
export async function decryptAudioBytes(encryptedBytes: Uint8Array, keyBase64: string): Promise<Uint8Array | null> {
  try {
    const key = await importKey(keyBase64)

    // Extract IV (first 12 bytes) and ciphertext
    const iv = encryptedBytes.slice(0, 12)
    const ciphertext = encryptedBytes.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext,
    )

    return new Uint8Array(decrypted)
  } catch (error) {
    console.error("Failed to decrypt audio bytes:", error)
    return null
  }
}

/**
 * Import a key from base64url string
 */
async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = base64UrlToArray(keyBase64)
  return await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
}

/**
 * Convert Uint8Array to base64url string
 */
function arrayToBase64Url(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

/**
 * Convert base64url string to Uint8Array
 */
function base64UrlToArray(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

// Additional utility functions can be added here if needed
