export function getStoredBoolean(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key)
    if (v === null) return fallback
    return v === 'true'
  } catch {
    return fallback
  }
}

export function setStoredBoolean(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? 'true' : 'false')
  } catch {
    // ignore
  }
}

