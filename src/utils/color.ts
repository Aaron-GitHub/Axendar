// Utility functions for color manipulation used across booking components

// Converts HEX (#RRGGBB or #RGB) to rgba(r,g,b,a)
export function hexToRgba(hex: string, alpha = 1): string {
  try {
    let h = hex.trim()
    if (h.startsWith('#')) h = h.slice(1)
    if (h.length === 3) {
      h = h.split('').map((c) => c + c).join('')
    }
    if (h.length !== 6) return hex
    const num = parseInt(h, 16)
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  } catch {
    return hex
  }
}
