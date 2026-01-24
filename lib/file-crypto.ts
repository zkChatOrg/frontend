"use client"

import { generateEncryptionKey } from "./crypto"

export interface EncryptedFile {
  iv: string
  ciphertext: string
  mimeType: string
  name: string
  size: number
}

export interface EncryptedFileResult {
  ciphertext: ArrayBuffer
  iv: Uint8Array
  rawKey: Uint8Array
  mimeType: string
  name: string
  size: number
}

/**
 * Generate a cryptographically random encryption key
 * Returns both the raw key bytes and base64url encoded version
 */
export function generateFileKeyWithRaw(): { keyBase64: string; rawKey: Uint8Array } {
  const rawKey = new Uint8Array(32) // 256 bits
  crypto.getRandomValues(rawKey)
  return {
    keyBase64: arrayToBase64Url(rawKey),
    rawKey,
  }
}

/**
 * Encrypt a file using AES-256-GCM
 * Returns raw binary ciphertext for direct upload
 */
export async function encryptFileForBinaryUpload(file: File): Promise<EncryptedFileResult> {
  const { rawKey } = generateFileKeyWithRaw()
  const arrayBuffer = await file.arrayBuffer()

  const key = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt"])

  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96 bits for GCM

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer,
  )

  return {
    ciphertext,
    iv,
    rawKey,
    mimeType: file.type || "application/octet-stream",
    name: file.name,
    size: file.size,
  }
}

/**
 * Decrypt raw binary ciphertext using AES-256-GCM
 */
export async function decryptBinaryFile(
  ciphertext: ArrayBuffer,
  keyBase64: string,
  ivBase64: string,
  mimeType: string,
): Promise<Blob> {
  const key = await importKey(keyBase64)
  const ivArray = base64UrlToArray(ivBase64)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivArray,
    },
    key,
    ciphertext,
  )

  return new Blob([decrypted], { type: mimeType })
}

/**
 * Build the share URL with key, iv, mime type, and filename in fragment
 */
export function buildShareUrl(
  baseUrl: string,
  id: string,
  rawKey: Uint8Array,
  iv: Uint8Array,
  mimeType: string,
  fileName: string,
): string {
  const k = arrayToBase64Url(rawKey)
  const ivStr = arrayToBase64Url(iv)
  const t = arrayToBase64Url(new TextEncoder().encode(mimeType))
  const n = arrayToBase64Url(new TextEncoder().encode(fileName))
  return `${baseUrl}/file/${id}#k=${k}&iv=${ivStr}&t=${t}&n=${n}`
}

/**
 * Parse the URL fragment to extract decryption params
 */
export function parseShareFragment(hash: string): {
  key: string | null
  iv: string | null
  mimeType: string | null
  fileName: string | null
} {
  const params = new URLSearchParams(hash.replace(/^#/, ""))
  const key = params.get("k")
  const iv = params.get("iv")
  const tEncoded = params.get("t")
  const nEncoded = params.get("n")

  let mimeType: string | null = null
  let fileName: string | null = null

  if (tEncoded) {
    try {
      mimeType = new TextDecoder().decode(base64UrlToArray(tEncoded))
    } catch {
      mimeType = "application/octet-stream"
    }
  }

  if (nEncoded) {
    try {
      fileName = new TextDecoder().decode(base64UrlToArray(nEncoded))
    } catch {
      fileName = "download"
    }
  }

  return { key, iv, mimeType, fileName }
}

// Keep existing functions for backward compatibility
/**
 * Encrypt a file using AES-256-GCM (legacy JSON format)
 */
export async function encryptFile(file: File, keyBase64: string): Promise<EncryptedFile> {
  const arrayBuffer = await file.arrayBuffer()
  const key = await importKey(keyBase64)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer,
  )

  return {
    iv: arrayToBase64Url(iv),
    ciphertext: arrayToBase64Url(new Uint8Array(encrypted)),
    mimeType: file.type || "application/octet-stream",
    name: file.name,
    size: file.size,
  }
}

/**
 * Decrypt a file using AES-256-GCM (legacy JSON format)
 */
export async function decryptFile(encryptedFile: EncryptedFile, keyBase64: string): Promise<Blob> {
  const key = await importKey(keyBase64)
  const ivArray = base64UrlToArray(encryptedFile.iv)
  const ciphertextArray = base64UrlToArray(encryptedFile.ciphertext)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivArray,
    },
    key,
    ciphertextArray,
  )

  return new Blob([decrypted], { type: encryptedFile.mimeType })
}

/**
 * Generate a file encryption key
 */
export function generateFileKey(): string {
  return generateEncryptionKey()
}

async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = base64UrlToArray(keyBase64)
  return await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
}

export function arrayToBase64Url(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export function base64UrlToArray(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}
