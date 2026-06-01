import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { signInWithGoogle, socialLogin } from '../../services/socialAuth'

export default function LoginWindow({ onClose, onShowConstruccion }) {
  const { login } = useAuth()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!user || !pass) {
      alert('Por favor, completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user, password: pass }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al iniciar sesión')
        return
      }
      login(data.user)
      onClose()

      if (data.user?.rol === 'admin') {
        navigate('/admin')
        return
      }

      onShowConstruccion()
    } catch {
      alert('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialLogin() {
    setSocialLoading(true)
    try {
      const userData = await signInWithGoogle()
      const result = await socialLogin(userData)
      if (result.error) {
        alert(result.error)
        return
      }
      login(result.user)
      onClose()

      if (result.user?.rol === 'admin') {
        navigate('/admin')
        return
      }

      onShowConstruccion()
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') return
      if (e.code === 'auth/unauthorized-domain' ||
          e.code === 'auth/operation-not-allowed' ||
          e.message?.includes('auth/')) {
        alert(`Error de configuración Firebase: ${e.code || e.message}. Revisa .env.example y configura Firebase Auth.`)
        return
      }
      alert('Error al iniciar sesión con Google')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div>
      <div className="title-bar">Introduce tus credenciales</div>
      <div className="form-group">
        <label>Email o Usuario:</label>
        <input
          type="text"
          placeholder="email@ejemplo.com o nombre de usuario"
          value={user}
          onChange={e => setUser(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
      </div>
      <div className="form-group">
        <label>Contraseña:</label>
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
      </div>
      <div className="btn-group">
        <button className="btn" onClick={handleLogin} disabled={loading}>{loading ? 'Entrando...' : 'Aceptar'}</button>
        <button className="btn" onClick={onClose}>Cancelar</button>
      </div>
      <div style={{ marginTop: 12, borderTop: '1px solid #808080', paddingTop: 10 }}>
        <p style={{ fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 8 }}>O inicia sesión con</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn"
            style={{ background: '#fff', color: '#333', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px' }}
            onClick={handleSocialLogin}
            disabled={socialLoading !== null}
          >
            {socialLoading
              ? '...'
              : <><img src="/Gifs/iconos/Google_icon.svg" alt="" style={{ width: 16, height: 16 }} /> Google</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
