const ICONS = [
  { action: 'login',       icon: '/Gifs/iconos/Iniciar_Sesion.png', label: 'Inicio de Sesión' },
  { action: 'registro',    icon: '/Gifs/iconos/registrarse.png',    label: 'Registrarse' },
  { action: 'foro',        icon: '/Gifs/iconos/foro.png',           label: 'Foros' },
  { action: 'reproductor', icon: '/Gifs/iconos/reproductor.png',    label: 'Reproductor' },
  { action: 'fondo',       icon: '/Gifs/iconos/fondo.png',          label: 'Fondo' },
  { action: 'noticias',    icon: '/Gifs/iconos/noticias.png',       label: 'Noticias' },
  { action: 'buscar',      icon: '/Gifs/iconos/buscar.png',         label: 'Buscar' },
  { action: 'suscribirse', icon: '/Gifs/iconos/suscribirse.png',    label: 'Suscribirse' },
]

export default function DesktopIcons({ onOpen }) {
  return (
    <div className="desktop-icons">
      {ICONS.map(item => (
        <div
          key={item.action}
          className="desktop-icon"
          onDoubleClick={() => onOpen(item.action)}
        >
          <img src={item.icon} alt={item.label} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
