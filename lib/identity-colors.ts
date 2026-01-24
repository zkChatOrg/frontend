// Deterministic color palette for sender identities
const IDENTITY_COLORS = [
  "#2563EB", // blue-500
  "#7C3AED", // purple-500
  "#059669", // emerald-600
  "#D97706", // amber-600
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#DC2626", // red-600
  "#16A34A", // green-600
  "#9333EA", // purple-600
  "#EA580C", // orange-600
  "#0891B2", // cyan-600
  "#4F46E5", // indigo-600
  "#C026D3", // fuchsia-600
  "#0D9488", // teal-600
  "#CA8A04", // yellow-600
  "#E11D48", // rose-600
  "#7C3AED", // violet-600
  "#2DD4BF", // teal-400
  "#F97316", // orange-500
  "#8B5CF6", // violet-500
]

/**
 * Generates a deterministic index from a senderId string using a simple hash.
 * The same senderId will ALWAYS produce the same index.
 */
function getIdentityIndex(senderId: string, modulo: number): number {
  let hash = 0
  for (let i = 0; i < senderId.length; i++) {
    hash = (hash * 31 + senderId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % modulo
}

/**
 * Returns a deterministic color for a given senderId.
 * The same senderId will ALWAYS return the same color, regardless of:
 * - Message order
 * - Session timing
 * - Which tab/window the user is in
 */
export function getColorForSenderId(senderId: string): string {
  const index = getIdentityIndex(senderId, IDENTITY_COLORS.length)
  return IDENTITY_COLORS[index]
}
