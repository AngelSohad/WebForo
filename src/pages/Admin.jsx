import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Taskbar from '../components/Taskbar'
import { useAuth } from '../context/AuthContext'

const DEFAULT_DATA = {
  suscriptores: [
    { id: 1, usuarioId: 1, nombre: 'Carlos García', email: 'carlos@email.com', plan: 'vip',     fechaInicio: '2024-01-15', estado: 'activo' },
    { id: 2, usuarioId: 2, nombre: 'María López',   email: 'maria@email.com',  plan: 'premium', fechaInicio: '2024-01-20', estado: 'activo' },
    { id: 3, usuarioId: 3, nombre: 'Juan Pérez',    email: 'juan@email.com',   plan: 'basico',  fechaInicio: '2024-02-05', estado: 'activo' },
    { id: 4, usuarioId: 5, nombre: 'Pedro Sánchez', email: 'pedro@email.com',  plan: 'premium', fechaInicio: '2024-02-20', estado: 'activo' },
  ],
  noticias: [
    { id: 1, titulo: '🚀 Nuevo Lenguaje de Programación revoluciona la industria', contenido: 'Los desarrolladores están adoptando rápidamente esta nueva tecnología...', categoria: 'programacion', fecha: '2024-02-25' },
    { id: 2, titulo: '🤖 IA generativa alcanza nuevos hitos en 2026',              contenido: 'Los últimos avances en inteligencia artificial están transformando múltiples sectores...', categoria: 'ia', fecha: '2024-02-24' },
    { id: 3, titulo: '🔒 Nuevo fallo de seguridad afecta a millones',             contenido: 'Expertos recomiendan actualizar todos los sistemas inmediatamente...', categoria: 'seguridad', fecha: '2024-02-23' },
  ],
  actividad: [
    { fecha: '2024-02-25 14:30', usuario: 'Carlos García', accion: 'Inicio de Sesión', detalles: 'Acceso desde Chrome' },
    { fecha: '2024-02-25 13:45', usuario: 'María López',   accion: 'Registro',         detalles: 'Nuevo usuario registrado' },
    { fecha: '2024-02-25 12:00', usuario: 'Sistema',       accion: 'Backup',           detalles: 'Copia de seguridad completada' },
    { fecha: '2024-02-25 10:15', usuario: 'Juan Pérez',    accion: 'Suscripción',      detalles: 'Plan: Básico' },
  ],
  estadisticas: { visitasTotales: 1247, visitasHoy: 45, visitasSemana: 312, nuevosHoy: 2 },
}

const EMPTY_USER_FORM = {
  nombre: '',
  email: '',
  password: '',
  rol: 'usuario',
  estado: 'activo',
  plan: 'basico',
}

function loadData() {
  try {
    const stored = localStorage.getItem('adminData')
    return stored ? JSON.parse(stored) : DEFAULT_DATA
  } catch { return DEFAULT_DATA }
}

function saveData(data) {
  localStorage.setItem('adminData', JSON.stringify(data))
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').substring(0, 10)
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout: authLogout } = useAuth()
  const [section, setSection] = useState('dashboard')
  const [data, setData] = useState(loadData)
  const [dbUsuarios, setDbUsuarios] = useState([])
  const [dbLoading, setDbLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [rolFilter, setRolFilter] = useState('todos')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [editingUserId, setEditingUserId] = useState(null)
  const [savingUser, setSavingUser] = useState(false)
  const [newsForm, setNewsForm] = useState({ titulo: '', contenido: '', categoria: 'general' })
  const [settings, setSettings] = useState({ siteName: 'Mi Portal Tech', siteDescription: 'Portal de tecnología', siteEmail: 'admin@sitiotech.com', maintenanceMode: false, registrationEnabled: true, newsletterEnabled: true })

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      alert('Debes iniciar sesión como administrador para entrar al panel.')
      navigate('/')
    }
  }, [user, navigate])

  const notify = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const loadUsers = useCallback(async () => {
    setDbLoading(true)
    try {
      const params = new URLSearchParams()
      if (userSearch.trim()) params.set('buscar', userSearch.trim())
      if (rolFilter !== 'todos') params.set('rol', rolFilter)
      if (estadoFilter !== 'todos') params.set('estado', estadoFilter)

      const url = `/api/usuarios${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      const rows = await res.json()

      if (!res.ok) {
        notify(rows.error || 'Error al cargar usuarios', 'error')
        return
      }

      setDbUsuarios(rows.map(r => ({
        id: r.id,
        nombre: r.nombre,
        email: r.email,
        fechaRegistro: formatDate(r.fecha_registro),
        estado: r.estado || 'activo',
        rol: r.rol || 'usuario',
        plan: r.plan || 'basico',
        foto: r.foto || null,
        proveedor: r.proveedor || null,
      })))
    } catch (error) {
      console.error(error)
      notify('Error de conexión con la base de datos', 'error')
    } finally {
      setDbLoading(false)
    }
  }, [userSearch, rolFilter, estadoFilter, notify])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    saveData(data)
  }, [data])

  function addActivity(accion, detalles) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    setData(prev => ({
      ...prev,
      actividad: [{ fecha: now, usuario: user?.nombre || 'Admin', accion, detalles }, ...prev.actividad].slice(0, 50)
    }))
  }

  function resetUserForm() {
    setUserForm(EMPTY_USER_FORM)
    setEditingUserId(null)
  }

  async function saveUser(e) {
    e?.preventDefault()

    if (!userForm.nombre.trim() || !userForm.email.trim()) {
      notify('Nombre y email son obligatorios', 'error')
      return
    }

    if (!editingUserId && !userForm.password.trim()) {
      notify('La contraseña es obligatoria al crear usuario/admin', 'error')
      return
    }

    setSavingUser(true)

    try {
      const method = editingUserId ? 'PUT' : 'POST'
      const url = editingUserId ? `/api/usuarios/${editingUserId}` : '/api/usuarios'

      const body = {
        nombre: userForm.nombre.trim(),
        email: userForm.email.trim(),
        rol: userForm.rol,
        estado: userForm.estado,
        plan: userForm.plan,
      }

      if (userForm.password.trim()) {
        body.password = userForm.password.trim()
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = await res.json()

      if (!res.ok) {
        notify(payload.error || 'No se pudo guardar', 'error')
        return
      }

      notify(editingUserId ? 'Usuario/administrador actualizado' : 'Usuario/administrador creado')
      addActivity(editingUserId ? 'Editar Usuario' : 'Crear Usuario', `${body.nombre} (${body.rol})`)
      resetUserForm()
      await loadUsers()
    } catch (error) {
      console.error(error)
      notify('Error de conexión con el servidor', 'error')
    } finally {
      setSavingUser(false)
    }
  }

  function startEditUser(u) {
    setEditingUserId(u.id)
    setUserForm({
      nombre: u.nombre,
      email: u.email,
      password: '',
      rol: u.rol || 'usuario',
      estado: u.estado || 'activo',
      plan: u.plan || 'basico',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteUser(id) {
    const u = dbUsuarios.find(u => u.id === id)
    if (!u || !window.confirm(`¿Eliminar al ${u.rol === 'admin' ? 'administrador' : 'usuario'} "${u.nombre}"?`)) return

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      const payload = await res.json().catch(() => ({}))

      if (!res.ok) {
        notify(payload.error || 'Error al eliminar', 'error')
        return
      }

      addActivity('Eliminar Usuario', `${u.nombre} eliminado`)
      notify('Usuario/administrador eliminado')
      await loadUsers()
    } catch (error) {
      console.error(error)
      notify('Error al eliminar de la base de datos', 'error')
    }
  }

  function viewUser(u) {
    alert(
      `👤 ${u.nombre}\n` +
      `📧 ${u.email}\n` +
      `🛡️ Rol: ${u.rol}\n` +
      `💳 Plan: ${u.plan}\n` +
      `⚡ Estado: ${u.estado}\n` +
      `📅 Registro: ${u.fechaRegistro}\n` +
      `🔗 Proveedor: ${u.proveedor || 'normal'}`
    )
  }

  function cancelSubscription(id) {
    const s = data.suscriptores.find(s => s.id === id)
    if (!s || !window.confirm(`¿Cancelar suscripción de ${s.nombre}?`)) return
    setData(prev => ({
      ...prev,
      suscriptores: prev.suscriptores.map(s => s.id === id ? { ...s, estado: 'inactivo' } : s)
    }))
    addActivity('Cancelar Suscripción', `Suscripción de ${s.nombre} cancelada`)
    notify('Suscripción cancelada')
  }

  function addNews() {
    if (!newsForm.titulo || !newsForm.contenido) { notify('Completa título y contenido', 'error'); return }
    const nueva = { id: Date.now(), ...newsForm, fecha: new Date().toISOString().split('T')[0], autor: user?.nombre || 'Admin' }
    setData(prev => ({ ...prev, noticias: [nueva, ...prev.noticias] }))
    setNewsForm({ titulo: '', contenido: '', categoria: 'general' })
    addActivity('Nueva Noticia', `Noticia "${nueva.titulo}" publicada`)
    notify('¡Noticia publicada!')
  }

  function deleteNews(id) {
    const n = data.noticias.find(n => n.id === id)
    if (!n || !window.confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return
    setData(prev => ({ ...prev, noticias: prev.noticias.filter(n => n.id !== id) }))
    addActivity('Eliminar Noticia', 'Noticia eliminada')
    notify('Noticia eliminada')
  }

  function logout() {
    if (window.confirm('¿Cerrar sesión?')) {
      authLogout()
      navigate('/')
    }
  }

  const usuariosAMostrar = dbUsuarios
  const totalAdmins = dbUsuarios.filter(u => u.rol === 'admin').length
  const totalUsuarios = dbUsuarios.filter(u => u.rol === 'usuario').length
  const basicos  = data.suscriptores.filter(s => s.plan === 'basico').length
  const premium  = data.suscriptores.filter(s => s.plan === 'premium').length
  const vip      = data.suscriptores.filter(s => s.plan === 'vip').length
  const ingresos = (premium * 9.99 + vip * 19.99).toFixed(2)

  const MENU = [
    { id: 'dashboard',     label: '📊 Dashboard' },
    { id: 'usuarios',      label: '👥 Usuarios/Admins' },
    { id: 'suscriptores',  label: '💳 Suscriptores' },
    { id: 'noticias',      label: '📰 Noticias' },
    { id: 'configuracion', label: '⚙️ Configuración' },
    { id: 'estadisticas',  label: '📈 Estadísticas' },
  ]

  return (
    <>
      <div className="desktop" style={{ padding: 0 }}>
        <div className="admin-panel">
          <div className="admin-sidebar">
            <div className="admin-sidebar-title">⚙️ Panel Admin</div>
            {MENU.map(m => (
              <div key={m.id} className={`admin-menu-item ${section === m.id ? 'active' : ''}`} onClick={() => setSection(m.id)}>
                {m.label}
              </div>
            ))}
            <div className="admin-menu-item" style={{ color: '#800000', marginTop: 20 }} onClick={logout}>
              🚪 Cerrar Sesión
            </div>
          </div>

          <div className="admin-content">
            {section === 'dashboard' && (
              <div>
                <h2>📊 Dashboard - Resumen General</h2>
                <div className="admin-stats">
                  <div className="stat-card"><div className="number">{dbUsuarios.length}</div><div className="label">Cuentas Totales</div></div>
                  <div className="stat-card"><div className="number">{totalUsuarios}</div><div className="label">Usuarios</div></div>
                  <div className="stat-card"><div className="number">{totalAdmins}</div><div className="label">Administradores</div></div>
                  <div className="stat-card"><div className="number">{data.noticias.length}</div><div className="label">Noticias</div></div>
                </div>
                <div className="admin-form">
                  <h3 style={{ marginBottom: 10, color: '#000080' }}>📋 Actividad Reciente</h3>
                  <table className="admin-table">
                    <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalles</th></tr></thead>
                    <tbody>
                      {data.actividad.length === 0
                        ? <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>Sin actividad</td></tr>
                        : data.actividad.map((a, i) => (
                          <tr key={i}><td>{a.fecha}</td><td>{a.usuario}</td><td>{a.accion}</td><td>{a.detalles}</td></tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {section === 'usuarios' && (
              <div>
                <h2>👥 CRUD Completo de Usuarios y Administradores</h2>

                <form className="admin-form" onSubmit={saveUser}>
                  <h3 style={{ marginBottom: 10, color: '#000080' }}>
                    {editingUserId ? '✏️ Editar cuenta' : '➕ Crear usuario / administrador'}
                  </h3>
                  <div className="form-group">
                    <label>Nombre:</label>
                    <input type="text" value={userForm.nombre} onChange={e => setUserForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo" />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="form-group">
                    <label>{editingUserId ? 'Nueva contraseña (opcional):' : 'Contraseña:'}</label>
                    <input type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} placeholder={editingUserId ? 'Deja vacío para conservarla' : 'Mínimo 6 caracteres'} />
                  </div>
                  <div className="form-group">
                    <label>Rol:</label>
                    <select value={userForm.rol} onChange={e => setUserForm(p => ({ ...p, rol: e.target.value }))}>
                      <option value="usuario">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estado:</label>
                    <select value={userForm.estado} onChange={e => setUserForm(p => ({ ...p, estado: e.target.value }))}>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Plan:</label>
                    <select value={userForm.plan} onChange={e => setUserForm(p => ({ ...p, plan: e.target.value }))}>
                      <option value="basico">Básico</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div className="btn-group">
                    <button className="btn" type="submit" disabled={savingUser}>{savingUser ? 'Guardando...' : editingUserId ? 'Actualizar' : 'Crear'}</button>
                    {editingUserId && <button className="btn" type="button" onClick={resetUserForm}>Cancelar edición</button>}
                  </div>
                </form>

                <div className="admin-search">
                  <input type="text" placeholder="Buscar por nombre o email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  <select value={rolFilter} onChange={e => setRolFilter(e.target.value)}>
                    <option value="todos">Todos los roles</option>
                    <option value="usuario">Usuarios</option>
                    <option value="admin">Administradores</option>
                  </select>
                  <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}>
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                  </select>
                  <button className="btn" onClick={() => { setUserSearch(''); setRolFilter('todos'); setEstadoFilter('todos') }}>Limpiar</button>
                  <button className="btn" onClick={loadUsers}>Actualizar</button>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Plan</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {dbLoading
                      ? <tr><td colSpan="8" style={{ textAlign: 'center', color: '#888' }}>Cargando usuarios desde MySQL...</td></tr>
                      : usuariosAMostrar.length === 0
                        ? <tr><td colSpan="8" style={{ textAlign: 'center', color: '#888' }}>Sin resultados</td></tr>
                        : usuariosAMostrar.map(u => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="user-avatar">{u.nombre.charAt(0)}</div>{u.nombre}</div></td>
                            <td>{u.email}</td>
                            <td><span className={`status-badge ${u.rol === 'admin' ? 'vip' : 'activo'}`}>{u.rol.toUpperCase()}</span></td>
                            <td><span className={`status-badge ${u.plan}`}>{u.plan.toUpperCase()}</span></td>
                            <td>{u.fechaRegistro}</td>
                            <td><span className={`status-badge ${u.estado}`}>{u.estado.toUpperCase()}</span></td>
                            <td>
                              <button className="action-btn" onClick={() => viewUser(u)}>👁 Ver</button>
                              <button className="action-btn" onClick={() => startEditUser(u)}>✏️ Editar</button>
                              <button className="action-btn danger" onClick={() => deleteUser(u.id)}>🗑️</button>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            )}

            {section === 'suscriptores' && (
              <div>
                <h2>💳 Gestión de Suscriptores</h2>
                <div className="admin-stats" style={{ marginBottom: 20 }}>
                  <div className="stat-card"><div className="number">{basicos}</div><div className="label">Plan Básico</div></div>
                  <div className="stat-card"><div className="number">{premium}</div><div className="label">Plan Premium</div></div>
                  <div className="stat-card"><div className="number">{vip}</div><div className="label">Plan VIP</div></div>
                  <div className="stat-card"><div className="number">${ingresos}</div><div className="label">Ingresos Mensuales</div></div>
                </div>
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Usuario</th><th>Email</th><th>Plan</th><th>Inicio</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {data.suscriptores.map(s => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="user-avatar">{s.nombre.charAt(0)}</div>{s.nombre}</div></td>
                        <td>{s.email}</td>
                        <td><span className={`status-badge ${s.plan}`}>{s.plan.toUpperCase()}</span></td>
                        <td>{s.fechaInicio}</td>
                        <td><span className={`status-badge ${s.estado}`}>{s.estado.toUpperCase()}</span></td>
                        <td><button className="action-btn danger" onClick={() => cancelSubscription(s.id)}>❌ Cancelar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section === 'noticias' && (
              <div>
                <h2>📰 Gestión de Noticias</h2>
                <div className="admin-form">
                  <h3 style={{ marginBottom: 10, color: '#000080' }}>➕ Añadir Nueva Noticia</h3>
                  <div className="form-group"><label>Título:</label><input type="text" value={newsForm.titulo} onChange={e => setNewsForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Título de la noticia" /></div>
                  <div className="form-group"><label>Contenido:</label><textarea value={newsForm.contenido} onChange={e => setNewsForm(p => ({ ...p, contenido: e.target.value }))} placeholder="Contenido..." style={{ width: '100%', minHeight: 80, padding: 6, fontFamily: 'inherit', fontSize: 12, border: '2px solid #808080' }} /></div>
                  <div className="form-group">
                    <label>Categoría:</label>
                    <select value={newsForm.categoria} onChange={e => setNewsForm(p => ({ ...p, categoria: e.target.value }))}>
                      <option value="general">General</option><option value="tecnologia">Tecnología</option><option value="programacion">Programación</option><option value="seguridad">Ciberseguridad</option><option value="hardware">Hardware</option><option value="ia">Inteligencia Artificial</option>
                    </select>
                  </div>
                  <button className="btn" onClick={addNews}>Publicar Noticia</button>
                </div>
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Título</th><th>Categoría</th><th>Fecha</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {data.noticias.map(n => (
                      <tr key={n.id}>
                        <td>{n.id}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.titulo}</td>
                        <td>{n.categoria?.toUpperCase()}</td><td>{n.fecha}</td>
                        <td><button className="action-btn" onClick={() => alert(`📰 ${n.titulo}\n\n${n.contenido}`)}>👁 Ver</button><button className="action-btn danger" onClick={() => deleteNews(n.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section === 'configuracion' && (
              <div>
                <h2>⚙️ Configuración del Sitio</h2>
                <div className="admin-form">
                  <h3 style={{ marginBottom: 10, color: '#000080' }}>🌐 Información del Sitio</h3>
                  <div className="form-group"><label>Nombre del Sitio:</label><input type="text" value={settings.siteName} onChange={e => setSettings(p => ({ ...p, siteName: e.target.value }))} /></div>
                  <div className="form-group"><label>Descripción:</label><input type="text" value={settings.siteDescription} onChange={e => setSettings(p => ({ ...p, siteDescription: e.target.value }))} /></div>
                  <div className="form-group"><label>Email de Contacto:</label><input type="email" value={settings.siteEmail} onChange={e => setSettings(p => ({ ...p, siteEmail: e.target.value }))} /></div>
                </div>
                <div className="admin-form">
                  <h3 style={{ marginBottom: 10, color: '#000080' }}>🔔 Mantenimiento</h3>
                  <div className="form-group"><label><input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings(p => ({ ...p, maintenanceMode: e.target.checked }))} style={{ marginRight: 6 }} /> Modo Mantenimiento</label></div>
                  <div className="form-group"><label><input type="checkbox" checked={settings.registrationEnabled} onChange={e => setSettings(p => ({ ...p, registrationEnabled: e.target.checked }))} style={{ marginRight: 6 }} /> Permitir Registros</label></div>
                  <div className="form-group"><label><input type="checkbox" checked={settings.newsletterEnabled} onChange={e => setSettings(p => ({ ...p, newsletterEnabled: e.target.checked }))} style={{ marginRight: 6 }} /> Newsletter Activado</label></div>
                </div>
                <button className="btn" style={{ marginTop: 15 }} onClick={() => { localStorage.setItem('siteSettings', JSON.stringify(settings)); addActivity('Configuración', 'Guardada'); notify('¡Configuración guardada!') }}>Guardar Configuración</button>
              </div>
            )}

            {section === 'estadisticas' && (
              <div>
                <h2>📈 Estadísticas Detalladas</h2>
                <div className="admin-stats">
                  <div className="stat-card"><div className="number">{data.estadisticas.visitasHoy}</div><div className="label">Visitas Hoy</div></div>
                  <div className="stat-card"><div className="number">{data.estadisticas.visitasSemana}</div><div className="label">Visitas Esta Semana</div></div>
                  <div className="stat-card"><div className="number">{data.estadisticas.nuevosHoy}</div><div className="label">Nuevos Usuarios Hoy</div></div>
                </div>
                <div className="admin-form" style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 10, color: '#000080' }}>📊 Distribución por Plan</h3>
                  <div className="chart-placeholder">
                    [Gráfico de distribución de suscriptores por plan]<br />
                    <small>Plan Básico: {basicos} | Premium: {premium} | VIP: {vip}</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <div className="notification" style={{ backgroundColor: notification.type === 'error' ? '#800000' : '#000080' }}>
          {notification.msg}
        </div>
      )}

      <Taskbar windows={[]} activeId={null} onStartClick={() => navigate('/')} onTaskbarItemClick={() => {}} />
    </>
  )
}
