export default function ConstruccionWindow({ onClose }) {
  return (
    <div className="construccion-content">
      <div className="title-bar">Inicio de Sesión Exitoso</div>
      <div className="construccion-mensaje">
        <img src="/Gifs/Tux.gif" alt="Tux" className="construccion-img" />
      </div>
      <div className="construccion-texto">INICIO DE SESIÓN EXITOSO</div>
      <div className="btn-group">
        <button className="btn" onClick={onClose}>Aceptar</button>
      </div>
    </div>
  )
}
