import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { signInWithGoogle, socialLogin } from '../../services/socialAuth'

export default function RegisterWindow({ onClose, onShowConstruccion }) {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  async function handleRegister() {
    if (!name || !email || !pass || !pass2) {
      alert('Por favor, completa todos los campos.')
      return
    }
    if (pass.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (pass !== pass2) {
      alert('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, email, password: pass }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al registrarse')
        return
      }
      login(data.user)
      onShowConstruccion()
      onClose()
    } catch {
      alert('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialRegister() {
    setSocialLoading(true)
    try {
      const userData = await signInWithGoogle()
      const result = await socialLogin(userData)
      if (result.error) {
        alert(result.error)
        return
      }
      login(result.user)
      onShowConstruccion()
      onClose()
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') return
      if (e.code === 'auth/unauthorized-domain' ||
          e.code === 'auth/operation-not-allowed' ||
          e.message?.includes('auth/')) {
        alert(`Error de configuración Firebase: ${e.code || e.message}. Revisa .env.example y configura Firebase Auth.`)
        return
      }
      alert('Error al registrarse con Google')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div>
      <div className="title-bar">Crea tu cuenta</div>
      <div className="form-group">
        <label>Nombre o Alias:</label>
        <input type="text" placeholder="Tu nombre o apodo" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Correo Electrónico:</label>
        <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Contraseña:</label>
        <input type="password" placeholder="Mínimo 8 caracteres" value={pass} onChange={e => setPass(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Confirmar Contraseña:</label>
        <input type="password" placeholder="Repite la contraseña" value={pass2} onChange={e => setPass2(e.target.value)} />
      </div>
      <div className="btn-group">
        <button className="btn" onClick={handleRegister} disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        <button className="btn" onClick={onClose}>Cancelar</button>
      </div>
      <div style={{ marginTop: 12, borderTop: '1px solid #808080', paddingTop: 10 }}>
        <p style={{ fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 8 }}>O regístrate con</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn"
            style={{ background: '#fff', color: '#333', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px' }}
            onClick={handleSocialRegister}
            disabled={socialLoading !== null}
          >
            {socialLoading
              ? '...'
              : <><img src="/Gifs/iconos/Google_icon.svg" alt="" style={{ width: 16, height: 16 }} /> Google</>
            }
          </button>
        </div>
      </div>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <img src="/Gifs/gif_ciudad.gif" alt="Ciudad" style={{ maxWidth: '100%', borderRadius: 4 }} />
      </div>
    </div>
  )
}
