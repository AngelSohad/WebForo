import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function ProfileWindow({ onClose, onOpenSubscription }) {
  const { user, logout, updateUser } = useAuth()
  const [tab, setTab] = useState('info')
  const [editName, setEditName] = useState(user?.nombre || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSaveProfile() {
    if (!editName || !editEmail) {
      alert('Nombre y email son obligatorios.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editName, email: editEmail }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al guardar')
        return
      }
      updateUser({ nombre: editName, email: editEmail })
      alert('Perfil actualizado correctamente.')
    } catch {
      alert('Error de conexión con el servidor')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!currentPass || !newPass || !confirmPass) {
      alert('Completa todos los campos de contraseña.')
      return
    }
    if (newPass.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (newPass !== confirmPass) {
      alert('Las contraseñas no coinciden.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/usuarios/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al cambiar contraseña')
        return
      }
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
      alert('Contraseña cambiada correctamente.')
    } catch {
      alert('Error de conexión con el servidor')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    if (window.confirm('¿Cerrar sesión?')) {
      logout()
      onClose()
    }
  }

  const currentPlan = user?.plan || 'basico'
  const planNames = { basico: 'Básico', premium: 'Premium', vip: 'VIP' }

  return (
    <div>
      <div className="title-bar">Configuración de Perfil</div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 10 }}>
        {['info', 'password', 'suscripcion'].map((t) => (
          <div
            key={t}
            style={{
              padding: '4px 12px', cursor: 'pointer', fontSize: 11,
              background: tab === t ? '#000080' : '#c0c0c0',
              color: tab === t ? 'white' : '#000',
              borderTop: '2px solid #fff', borderLeft: '2px solid #fff',
              borderRight: '2px solid #808080',
            }}
            onClick={() => setTab(t)}
          >
            {t === 'info' ? '📋 Información' : t === 'password' ? '🔐 Contraseña' : '💳 Suscripción'}
          </div>
        ))}
      </div>

      {tab === 'info' && (
        <div className="panel">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <img
              src={user?.foto || '/Gifs/iconos/perfil.png'}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', display: 'block', border: '3px solid #fff' }}
            />
          </div>
          <div className="form-group">
            <label>Nombre:</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
          <div className="btn-group">
            <button className="btn" onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
          <div style={{ marginTop: 16, borderTop: '2px solid #808080', paddingTop: 12 }}>
            <button className="btn" style={{ color: '#800000', width: '100%' }} onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div className="panel">
          <div className="form-group">
            <label>Contraseña Actual:</label>
            <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Nueva Contraseña:</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirmar Nueva Contraseña:</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          </div>
          <div className="btn-group">
            <button className="btn" onClick={handleChangePassword} disabled={saving}>
              {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>
      )}

      {tab === 'suscripcion' && (
        <div className="panel">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 'bold' }}>Plan Actual:</label>
            <div style={{
              display: 'inline-block', marginTop: 4, padding: '4px 16px',
              background: currentPlan === 'vip' ? '#c0a030' : currentPlan === 'premium' ? '#000080' : '#808080',
              color: 'white', fontWeight: 'bold', fontSize: 14,
              borderTop: '2px solid #fff', borderLeft: '2px solid #fff',
              borderRight: '2px solid #000', borderBottom: '2px solid #000',
            }}>
              {planNames[currentPlan]?.toUpperCase() || 'BÁSICO'}
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
            {currentPlan === 'basico'
              ? 'Actualmente tienes el plan gratuito. Actualiza para obtener más beneficios.'
              : 'Disfruta de los beneficios de tu plan actual.'}
          </p>
          <div className="btn-group">
            <button className="btn" onClick={() => { onOpenSubscription && onOpenSubscription(); onClose() }}>
              {currentPlan === 'basico' ? '⭐ Ver Planes de Pago' : '🔄 Cambiar de Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
