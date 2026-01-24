"use client"

/**
 * Global API configuration utility
 * Manages the backend API base URL from environment variables
 */

let errorModalShown = false

/**
 * Get the API base URL from environment variables
 * @throws Error if NEXT_PUBLIC_API_BASE is not configured
 * @returns Clean API base URL without trailing slash
 */
export function getApiBase(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE

  if (!apiBase || apiBase.trim() === "") {
    // Show error modal only once
    if (!errorModalShown) {
      errorModalShown = true
      showApiErrorModal()
    }
    throw new Error("NEXT_PUBLIC_API_BASE is not configured")
  }

  // Remove trailing slash if present
  return apiBase.replace(/\/$/, "")
}

/**
 * Show a full-screen error modal when API is not configured
 */
function showApiErrorModal() {
  // Create modal overlay
  const overlay = document.createElement("div")
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  `

  // Create modal content
  const modal = document.createElement("div")
  modal.style.cssText = `
    background: hsl(var(--background));
    border-radius: 1rem;
    padding: 2rem;
    max-width: 28rem;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    border: 1px solid hsl(var(--border));
  `

  modal.innerHTML = `
    <div style="text-align: center; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; border-radius: 9999px; background: hsl(var(--secondary)); margin: 0 auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--destructive));">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: hsl(var(--foreground)); margin: 0;">API not configured</h2>
      <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem; line-height: 1.5; margin: 0;">
        The backend API base URL is missing. Please set <code style="background: hsl(var(--secondary)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace;">NEXT_PUBLIC_API_BASE</code> in your environment.
      </p>
      <button id="api-error-reload" style="
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        padding: 0.75rem 2rem;
        border-radius: 9999px;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        margin-top: 0.5rem;
      ">
        Reload
      </button>
    </div>
  `

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  // Reload button handler
  const reloadBtn = document.getElementById("api-error-reload")
  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      window.location.reload()
    })
  }
}

/**
 * Get WebSocket base URL derived from API base
 * Converts http(s) to ws(s)
 * @returns WebSocket base URL
 */
export function getWsBase(): string {
  const apiBase = getApiBase()
  return apiBase.replace(/^http/, "ws")
}
