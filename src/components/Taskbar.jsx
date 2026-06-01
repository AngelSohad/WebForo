import { useState, useEffect } from 'react'

export default function Taskbar({ windows, activeId, onStartClick, onTaskbarItemClick }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    function updateClock() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const mins = now.getMinutes().toString().padStart(2, '0')
      setTime(`${hours}:${mins}`)
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="taskbar">
      <button className="start-button" onClick={onStartClick} />
      <div className="taskbar-apps">
        {windows.map(win => (
          <div
            key={win.id}
            className={`taskbar-item ${activeId === win.id && !win.minimized ? 'active' : ''}`}
            onClick={() => onTaskbarItemClick(win.id)}
          >
            {win.title}
          </div>
        ))}
      </div>
      <div className="taskbar-clock">{time}</div>
    </div>
  )
}
