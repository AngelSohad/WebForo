export default function StartMenu({ onAction, onClose }) {
  const items = [
    { action: 'login',       icon: '/Gifs/iconos/Iniciar_Sesion.png', label: 'Inicio de Sesión' },
    { action: 'registro',    icon: '/Gifs/iconos/registrarse.png',    label: 'Registrarse' },
    { action: 'foro',        icon: '/Gifs/iconos/foro.png',           label: 'Foros' },
    { action: 'reproductor', icon: '/Gifs/iconos/reproductor.png',    label: 'Reproductor' },
    { action: 'fondo',       icon: '/Gifs/iconos/fondo.png',          label: 'Fondo' },
    { action: 'noticias',    icon: '/Gifs/iconos/noticias.png',       label: 'Noticias' },
    { action: 'buscar',      icon: '/Gifs/iconos/buscar.png',         label: 'Buscar' },
    { action: 'suscribirse', icon: '/Gifs/iconos/suscribirse.png',    label: 'Suscribirse' },
  ]

  function handleClick(action) {
    onAction(action)
    onClose()
  }

  return (
    <div className="start-menu">
      <div className="start-menu-sidebar">
        <span>Blog_Web</span>
      </div>
      <div className="start-menu-items">
        {items.map(item => (
          <div
            key={item.action}
            className="start-menu-item"
            onClick={() => handleClick(item.action)}
          >
            <img src={item.icon} className="menu-icon" alt="" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
