export default function PurchaseSuccessWindow({ onClose, plan }) {
  const planNames = { basico: 'Básico', premium: 'Premium', vip: 'VIP' }

  return (
    <div className="construccion-content">
      <div className="title-bar">Compra Exitosa</div>
      <div className="construccion-mensaje">
        <img src="/Gifs/compras.gif" alt="Compra exitosa" className="construccion-img" />
        <img src="/Gifs/trompeta.gif" alt="Festejo" className="construccion-img" style={{ width: 60, height: 60 }} />
      </div>
      <div className="construccion-texto">¡SUSCRIPCIÓN ACTIVADA!</div>
      <div className="purchase-plan-badge">
        Plan {planNames[plan] || plan?.toUpperCase()}
      </div>
      <p style={{ fontSize: 11, color: '#666', margin: '10px 0' }}>
        Ya puedes disfrutar de todos los beneficios de tu nuevo plan.
      </p>
      <div className="btn-group">
        <button className="btn" onClick={onClose}>Aceptar</button>
      </div>
    </div>
  )
}
