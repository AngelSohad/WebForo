import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MpReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const collectionStatus = searchParams.get('status') || searchParams.get('collection_status')
  const userId = searchParams.get('userId') || user?.id
  const plan = searchParams.get('plan')

  useEffect(() => {
    if ((collectionStatus === 'approved' || collectionStatus === 'success') && userId && plan) {
      fetch(`/api/mp/success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), plan }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.plan) updateUser({ plan: data.plan })
        })
        .catch(() => {})
    }
    const timer = setTimeout(() => navigate('/'), 3000)
    return () => clearTimeout(timer)
  }, [collectionStatus, navigate, plan, updateUser, userId])

  const isSuccess = collectionStatus === 'approved' || collectionStatus === 'success'
  const isFailure = collectionStatus === 'rejected' || collectionStatus === 'failure'
  const msg = isSuccess
    ? { icon: '✅', title: '¡Pago Exitoso!', text: 'Tu suscripción ha sido activada. Serás redirigido...', color: '#008000' }
    : isFailure
    ? { icon: '❌', title: 'Pago Rechazado', text: 'El pago no pudo completarse. Serás redirigido...', color: '#800000' }
    : { icon: '⏳', title: 'Procesando...', text: 'Estamos verificando tu pago. Serás redirigido...', color: '#808000' }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#c0c0c0', fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: '#c0c0c0', padding: 40, textAlign: 'center',
        borderTop: '2px solid #fff', borderLeft: '2px solid #fff',
        borderRight: '2px solid #000', borderBottom: '2px solid #000',
        minWidth: 320,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{msg.icon}</div>
        <h2 style={{ color: msg.color, marginBottom: 8 }}>{msg.title}</h2>
        <p style={{ fontSize: 12, color: '#666' }}>{msg.text}</p>
      </div>
    </div>
  )
}
