import { useState, useEffect, useCallback } from 'react'
import Taskbar from '../components/Taskbar'
import StartMenu from '../components/StartMenu'
import DesktopIcons from '../components/DesktopIcons'
import ProfileIcon from '../components/ProfileIcon'
import Window from '../components/Window'
import LoginWindow from '../components/windows/LoginWindow'
import RegisterWindow from '../components/windows/RegisterWindow'
import ForumWindow from '../components/windows/ForumWindow'
import PlayerWindow from '../components/windows/PlayerWindow'
import BackgroundWindow from '../components/windows/BackgroundWindow'
import NewsWindow from '../components/windows/NewsWindow'
import SearchWindow from '../components/windows/SearchWindow'
import SubscribeWindow from '../components/windows/SubscribeWindow'
import ConstruccionWindow from '../components/windows/ConstruccionWindow'
import ProfileWindow from '../components/windows/ProfileWindow'
import PurchaseSuccessWindow from '../components/windows/PurchaseSuccessWindow'
import { useWindowManager } from '../hooks/useWindowManager'

const WINDOW_WIDTHS = {
  login: 320, registro: 320, foro: 450, reproductor: 400,
  fondo: 380, noticias: 400, buscar: 450, suscribirse: 380,
  construccion: 350, perfil: 400, 'compra-exitosa': 380,
}

const WINDOW_TITLES = {
  login: 'Inicio de Sesión', registro: 'Registrarse', foro: 'Foros',
  reproductor: 'Reproductor', fondo: 'Fondo', noticias: 'Noticias',
  buscar: 'Buscar', suscribirse: 'Suscribirse',
  construccion: 'Inicio de Sesión Exitoso', perfil: 'Mi Perfil',
  'compra-exitosa': 'Compra Exitosa',
}

export default function Desktop() {
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [background, setBackground] = useState({ type: 'image', value: '/Fondos/clouds.jpg' })
  const [purchasePlan, setPurchasePlan] = useState(null)
  const {
    windows, activeId,
    openWindow, closeWindow, minimizeWindow,
    focusWindow, moveWindow, toggleTaskbar,
  } = useWindowManager()

  useEffect(() => {
    if (background.type === 'color') {
      document.body.style.backgroundColor = background.value
      document.body.style.backgroundImage = 'none'
    } else {
      document.body.style.backgroundImage = `url(${background.value})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundColor = ''
    }
  }, [background])

  useEffect(() => {
    function handler(e) {
      if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
        setShowStartMenu(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const showConstruccion = useCallback(() => {
    openWindow('construccion')
  }, [openWindow])

  const showPurchaseSuccess = useCallback((plan) => {
    setPurchasePlan(plan)
    openWindow('compra-exitosa')
  }, [openWindow])

  function handleOpenSubscription() {
    openWindow('suscribirse')
  }

  function renderWindowContent(win) {
    const props = { onClose: () => closeWindow(win.id) }
    switch (win.type) {
      case 'login':           return <LoginWindow {...props} onShowConstruccion={showConstruccion} />
      case 'registro':        return <RegisterWindow {...props} onShowConstruccion={showConstruccion} />
      case 'foro':            return <ForumWindow />
      case 'reproductor':     return <PlayerWindow />
      case 'fondo':           return <BackgroundWindow onChangeBackground={setBackground} />
      case 'noticias':        return <NewsWindow />
      case 'buscar':          return <SearchWindow />
      case 'suscribirse':     return <SubscribeWindow {...props} onShowPurchaseSuccess={showPurchaseSuccess} />
      case 'construccion':    return <ConstruccionWindow onClose={() => closeWindow(win.id)} />
      case 'perfil':          return <ProfileWindow onClose={() => closeWindow(win.id)} onOpenSubscription={handleOpenSubscription} />
      case 'compra-exitosa':  return <PurchaseSuccessWindow onClose={() => closeWindow(win.id)} plan={purchasePlan} />
      default:                return null
    }
  }

  return (
    <>
      <div className="desktop" onClick={() => setShowStartMenu(false)}>
        <DesktopIcons onOpen={openWindow} />
        <ProfileIcon onOpen={openWindow} />

        {windows.map(win => (
          <Window
            key={win.id}
            win={{ ...win, title: WINDOW_TITLES[win.type], width: WINDOW_WIDTHS[win.type] }}
            isActive={activeId === win.id}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={focusWindow}
            onMove={moveWindow}
          >
            {renderWindowContent(win)}
          </Window>
        ))}
      </div>

      {showStartMenu && (
        <StartMenu
          onAction={openWindow}
          onClose={() => setShowStartMenu(false)}
        />
      )}

      <Taskbar
        windows={windows.map(w => ({ ...w, title: WINDOW_TITLES[w.type] }))}
        activeId={activeId}
        onStartClick={e => { e.stopPropagation(); setShowStartMenu(v => !v) }}
        onTaskbarItemClick={toggleTaskbar}
      />
    </>
  )
}
