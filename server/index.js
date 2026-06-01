import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import pool from './db.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
const mpClient = new MercadoPagoConfig({ accessToken: mpToken })

if (mpToken) {
  console.log(`✓ Mercado Pago configurado (token: ${mpToken.substring(0, 10)}...)`)
} else {
  console.warn('⚠ Mercado Pago NO configurado. Define MERCADOPAGO_ACCESS_TOKEN en .env')
}

app.use(cors())
app.use(express.json())

async function ensureColumn(sql) {
  try {
    await pool.query(sql)
  } catch {
    // La columna ya existe o la BD ya estaba migrada.
  }
}

async function prepararTablaUsuarios() {
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT 'usuario'")
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN estado VARCHAR(20) DEFAULT 'activo'")
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN plan VARCHAR(20) DEFAULT 'basico'")
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN firebase_uid VARCHAR(255) NULL")
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN foto TEXT NULL")
  await ensureColumn("ALTER TABLE usuarios ADD COLUMN proveedor VARCHAR(50) NULL")
  await ensureColumn('ALTER TABLE usuarios MODIFY password VARCHAR(255) NULL')
}

await prepararTablaUsuarios()

function cleanUser(user) {
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
}

function normalizarRol(rol = 'usuario') {
  return rol === 'admin' ? 'admin' : 'usuario'
}

function normalizarEstado(estado = 'activo') {
  return estado === 'inactivo' ? 'inactivo' : 'activo'
}

function normalizarPlan(plan = 'basico') {
  return ['basico', 'premium', 'vip'].includes(plan) ? plan : 'basico'
}

// =====================================================
// AUTH NORMAL
// =====================================================
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, estado, plan)
       VALUES (?, ?, ?, 'usuario', 'activo', 'basico')`,
      [nombre, email, hashedPassword]
    )

    res.status(201).json({
      message: 'Registro exitoso',
      user: { id: result.insertId, nombre, email, rol: 'usuario', estado: 'activo', plan: 'basico' },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/usuario y contraseña son obligatorios' })
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? OR nombre = ?', [email, email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const user = rows[0]

    if (user.estado === 'inactivo') {
      return res.status(403).json({ error: 'La cuenta está inactiva' })
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Esta cuenta debe iniciar sesión con Google' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      user: cleanUser({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol || 'usuario',
        estado: user.estado || 'activo',
        plan: user.plan || 'basico',
        foto: user.foto || null,
        proveedor: user.proveedor || null,
      }),
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// =====================================================
// CRUD COMPLETO USUARIOS / ADMINISTRADORES
// Misma tabla: usuarios. Diferencia: rol = usuario | admin
// =====================================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const { buscar = '', rol = '', estado = '' } = req.query
    const params = []
    const where = []

    if (buscar) {
      where.push('(nombre LIKE ? OR email LIKE ?)')
      params.push(`%${buscar}%`, `%${buscar}%`)
    }

    if (rol && ['usuario', 'admin'].includes(rol)) {
      where.push('rol = ?')
      params.push(rol)
    }

    if (estado && ['activo', 'inactivo'].includes(estado)) {
      where.push('estado = ?')
      params.push(estado)
    }

    const sql = `
      SELECT id, nombre, email, fecha_registro, estado, plan, rol, foto, proveedor
      FROM usuarios
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY fecha_registro DESC, id DESC
    `

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (error) {
    console.error('Get usuarios error:', error)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

app.get('/api/usuarios-finales', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, fecha_registro, estado, plan, rol, foto, proveedor
       FROM usuarios WHERE rol = 'usuario'
       ORDER BY fecha_registro DESC, id DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Get usuarios finales error:', error)
    res.status(500).json({ error: 'Error al obtener usuarios finales' })
  }
})

app.get('/api/administradores', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, fecha_registro, estado, plan, rol, foto, proveedor
       FROM usuarios WHERE rol = 'admin'
       ORDER BY fecha_registro DESC, id DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Get administradores error:', error)
    res.status(500).json({ error: 'Error al obtener administradores' })
  }
})

app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      `SELECT id, nombre, email, fecha_registro, estado, plan, rol, foto, proveedor
       FROM usuarios WHERE id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Show usuario error:', error)
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
})

app.post('/api/usuarios', async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      rol = 'usuario',
      estado = 'activo',
      plan = 'basico'
    } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son obligatorios'
      })
    }

    if (!['usuario', 'admin'].includes(rol)) {
      return res.status(400).json({
        error: 'Rol inválido. Usa usuario o admin'
      })
    }

    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Usa activo o inactivo'
      })
    }

    if (!['basico', 'premium', 'vip'].includes(plan)) {
      return res.status(400).json({
        error: 'Plan inválido'
      })
    }

    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (nombre, email, password, rol, estado, plan) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, email, hashedPassword, rol, estado, plan]
    )

    const [rows] = await pool.query(
      `SELECT id, nombre, email, rol, estado, plan, fecha_registro
       FROM usuarios
       WHERE id = ?`,
      [result.insertId]
    )

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      user: rows[0]
    })

  } catch (error) {
    console.error('Create usuario error REAL:', error)

    return res.status(500).json({
      error: 'Error al crear usuario',
      detalle: error.message,
      codigo: error.code,
      sqlMessage: error.sqlMessage
    })
  }
})

app.post('/api/administradores', async (req, res) => {
  try {
    const { nombre, email, password, estado, plan } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const userEstado = normalizarEstado(estado)
    const userPlan = normalizarPlan(plan)

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, estado, plan)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      [nombre, email, hashed, userEstado, userPlan]
    )

    const [created] = await pool.query(
      `SELECT id, nombre, email, fecha_registro, estado, plan, rol, foto, proveedor
       FROM usuarios WHERE id = ?`,
      [result.insertId]
    )

    res.status(201).json({ message: 'Administrador creado correctamente', user: created[0] })
  } catch (error) {
    console.error('Create administrador error:', error)
    res.status(500).json({ error: 'Error al crear administrador' })
  }
})

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, email, password, rol, estado, plan } = req.body

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' })
    }

    const [existsUser] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id])
    if (existsUser.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const [existingEmail] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id])
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'El email ya está en uso por otro usuario' })
    }

    const fields = ['nombre = ?', 'email = ?', 'rol = ?', 'estado = ?', 'plan = ?']
    const params = [nombre, email, normalizarRol(rol), normalizarEstado(estado), normalizarPlan(plan)]

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
      }
      fields.push('password = ?')
      params.push(await bcrypt.hash(password, 10))
    }

    params.push(id)
    await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, params)

    const [updated] = await pool.query(
      `SELECT id, nombre, email, fecha_registro, estado, plan, rol, foto, proveedor
       FROM usuarios WHERE id = ?`,
      [id]
    )

    res.json({ message: 'Usuario actualizado correctamente', user: updated[0] })
  } catch (error) {
    console.error('Update usuario error:', error)
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
})

app.put('/api/usuarios/:id/password', async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Ambas contraseñas son obligatorias' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const [rows] = await pool.query('SELECT password FROM usuarios WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password || '')
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, id])
    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Error al cambiar contraseña' })
  }
})

app.put('/api/usuarios/:id/plan', async (req, res) => {
  try {
    const { id } = req.params
    const { plan } = req.body
    const userPlan = normalizarPlan(plan)

    await pool.query('UPDATE usuarios SET plan = ? WHERE id = ?', [userPlan, id])
    res.json({ message: 'Plan actualizado', plan: userPlan })
  } catch (error) {
    console.error('Update plan error:', error)
    res.status(500).json({ error: 'Error al actualizar plan' })
  }
})

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Delete usuario error:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

// =====================================================
// GOOGLE / FIREBASE SOCIAL LOGIN
// =====================================================
app.post('/api/auth/social', async (req, res) => {
  try {
    const { uid, nombre, email, foto, proveedor } = req.body

    if (!uid || !email) {
      return res.status(400).json({ error: 'Datos de autenticación inválidos' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE firebase_uid = ? OR email = ?',
      [uid, email]
    )

    if (rows.length > 0) {
      const user = rows[0]
      await pool.query(
        'UPDATE usuarios SET firebase_uid = ?, foto = ?, proveedor = ?, estado = ? WHERE id = ?',
        [uid, foto || null, proveedor || null, user.estado || 'activo', user.id]
      )

      return res.json({
        message: 'Inicio de sesión exitoso',
        user: cleanUser({
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          foto: user.foto || foto,
          rol: user.rol || 'usuario',
          estado: user.estado || 'activo',
          plan: user.plan || 'basico',
          proveedor: user.proveedor || proveedor || null,
        }),
      })
    }

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, firebase_uid, foto, proveedor, rol, estado, plan)
       VALUES (?, ?, ?, ?, ?, ?, 'usuario', 'activo', 'basico')`,
      [nombre || email.split('@')[0], email, null, uid, foto || null, proveedor || null]
    )

    res.status(201).json({
      message: 'Registro exitoso',
      user: {
        id: result.insertId,
        nombre: nombre || email.split('@')[0],
        email,
        foto,
        rol: 'usuario',
        estado: 'activo',
        plan: 'basico',
        proveedor: proveedor || null,
      },
    })
  } catch (error) {
    console.error('Social auth error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// =====================================================
// MERCADO PAGO
// =====================================================
app.get('/api/mp/status', (_req, res) => {
  res.json({
    configured: !!mpToken,
    tokenPrefix: mpToken ? mpToken.substring(0, 10) + '...' : null,
    envFile: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
  })
})

app.post('/api/create_preference', async (req, res) => {
  try {
    const { title, price, userId, email, plan } = req.body

    if (!title || !price || !userId || !email || !plan) {
      return res.status(400).json({ error: 'Datos de pago incompletos' })
    }

    if (!mpClient.accessToken) {
      return res.status(500).json({
        error: 'Mercado Pago no está configurado. Define MERCADOPAGO_ACCESS_TOKEN en .env',
      })
    }

    const preference = new Preference(mpClient)
    const result = await preference.create({
      body: {
        items: [
          {
            title,
            quantity: 1,
            unit_price: Number(price),
            currency_id: 'MXN',
          },
        ],
        payer: { email },
        back_urls: {
          success: `${req.headers.origin || 'http://localhost:5173'}/mp/success?userId=${userId}&plan=${plan}`,
          failure: `${req.headers.origin || 'http://localhost:5173'}/mp/failure`,
          pending: `${req.headers.origin || 'http://localhost:5173'}/mp/pending`,
        },
        external_reference: `${userId}-${plan}-${Date.now()}`,
      },
    })

    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    })
  } catch (error) {
    console.error('Create preference error:', error)
    const message = error?.cause?.message || error?.message || error?.statusText || 'Error al crear preferencia de pago'
    res.status(500).json({ error: message, detail: error?.toString() })
  }
})

app.post('/api/mp/success', async (req, res) => {
  try {
    const { userId, plan } = req.body
    if (!userId || !plan) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }
    await pool.query('UPDATE usuarios SET plan = ? WHERE id = ?', [normalizarPlan(plan), userId])
    res.json({ message: 'Pago confirmado y plan actualizado', plan: normalizarPlan(plan) })
  } catch (error) {
    console.error('MP success error:', error)
    res.status(500).json({ error: 'Error al confirmar pago' })
  }
})
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist')

  app.use(express.static(distPath))

  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist')

  app.use(express.static(distPath))

  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`)
})
