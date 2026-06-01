import { useRef } from 'react'

export default function Window({ win, isActive, onClose, onMinimize, onFocus, onMove, children }) {
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)

  function handleMouseDown(e) {
    if (e.target.closest('.window-controls')) return
    onFocus(win.id)
    dragging.current = true
    dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y }

    function handleMouseMove(e) {
      if (!dragging.current) return
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - win.width - 10))
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 80))
      onMove(win.id, newX, newY)
    }
    function handleMouseUp() {
      dragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  if (win.minimized) return null

  return (
    <div
      className="window"
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        zIndex: win.zIndex,
        position: 'absolute',
        display: 'block',
      }}
      onMouseDown={() => onFocus(win.id)}
    >
      <div
        className={`window-header ${isActive ? '' : 'inactive'}`}
        onMouseDown={handleMouseDown}
      >
        <span className="window-title">{win.title}</span>
        <div className="window-controls">
          <div className="window-btn" onClick={() => onMinimize(win.id)}>_</div>
          <div className="window-btn" onClick={() => onClose(win.id)}>✕</div>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  )
}
