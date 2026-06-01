import { useAuth } from '../context/AuthContext'

export default function ProfileIcon({ onOpen }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div
      className="desktop-icon profile-icon"
      onDoubleClick={() => onOpen('perfil')}
      title="Mi Perfil"
    >
      {user.foto ? (
        <img src={user.foto} alt="" className="profile-icon-img" />
      ) : (
        <img src="/Gifs/iconos/perfil.png" alt="" className="profile-icon-img" />
      )}
      <span>Mi Perfil</span>
    </div>
  )
}
