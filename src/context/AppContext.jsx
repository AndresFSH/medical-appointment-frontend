import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
  // ── Theme ──────────────────────────────────────────────
  const [theme, setTheme] = useState(
    () => localStorage.getItem('umo_theme') ?? 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('umo_theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() =>
    setTheme(t => t === 'light' ? 'dark' : 'light')
  , [])

  // ── Toasts ────────────────────────────────────────────
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), duration)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur ?? 5000),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info',    dur),
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, toasts, toast, removeToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}