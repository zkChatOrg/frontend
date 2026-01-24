/**
 * Generates a cryptographically random room ID
 * @returns A 32-character alphanumeric room ID
 */
export function generateRoomId(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .substring(0, 32)
}
