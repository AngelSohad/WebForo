import { useState, useCallback } from 'react'

let globalZIndex = 100

const WINDOW_CONFIG = {
  login:       { title: 'Inicio de Sesión', width: 320 },
  registro:    { title: 'Registrarse',      width: 320 },
  foro:        { title: 'Foros',            width: 450 },
  reproductor: { title: 'Reproductor',      width: 400 },
  fondo:       { title: 'Fondo',            width: 380 },
  noticias:    { title: 'Noticias',         width: 400 },
  buscar:      { title: 'Buscar',           width: 450 },
  suscribirse: { title: 'Suscribirse',      width: 380 },
  construccion:{ title: 'Inicio de Sesión Exitoso', width: 350 },
  perfil:      { title: 'Mi Perfil',         width: 400 },
  'compra-exitosa': { title: 'Compra Exitosa', width: 380 },
}

export function useWindowManager() {
  const [windows, setWindows] = useState([])
  const [activeId, setActiveId] = useState(null)

  const openWindow = useCallback((type) => {
    const id = `${type}-${Date.now()}`
    const config = WINDOW_CONFIG[type]

    setWindows(prev => {
      const offset = (prev.filter(w => w.type === type).length) * 30
      return [...prev, {
        id,
        type,
        title: config.title,
        width: config.width,
        x: Math.min(80 + offset, window.innerWidth - config.width - 20),
        y: Math.min(60 + offset, window.innerHeight - 400),
        minimized: false,
        zIndex: ++globalZIndex,
      }]
    })
    setActiveId(id)
  }, [])

  const closeWindow = useCallback((id) => {
    setWindows(prev => prev.filter(w => w.id !== id))
    setActiveId(prev => (prev === id ? null : prev))
  }, [])

  const minimizeWindow = useCallback((id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w))
    setActiveId(null)
  }, [])

  const restoreWindow = useCallback((id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: ++globalZIndex } : w))
    setActiveId(id)
  }, [])

  const focusWindow = useCallback((id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: ++globalZIndex } : w))
    setActiveId(id)
  }, [])

  const moveWindow = useCallback((id, x, y) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w))
  }, [])

  const toggleTaskbar = useCallback((id) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === id)
      if (!win) return prev
      if (win.minimized) {
        return prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: ++globalZIndex } : w)
      }
      if (activeId === id) {
        return prev.map(w => w.id === id ? { ...w, minimized: true } : w)
      }
      return prev.map(w => w.id === id ? { ...w, zIndex: ++globalZIndex } : w)
    })
    if (activeId !== id) setActiveId(id)
  }, [activeId])

  return {
    windows,
    activeId,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    toggleTaskbar,
    WINDOW_CONFIG,
  }
}
