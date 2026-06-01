import { useState } from 'react'

const COLORS = ['#0B17B4','#000080','#008000','#800000','#000000','#808080','#008080','#800080','#808000','#c0c0c0']

export default function BackgroundWindow({ onChangeBackground }) {
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const [bgUrl, setBgUrl] = useState('')

  function applyColor(color) {
    setSelected(color)
    setPreview({ type: 'color', value: color })
    onChangeBackground({ type: 'color', value: color })
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target.result
      setPreview({ type: 'image', value: data })
      onChangeBackground({ type: 'image', value: data })
    }
    reader.readAsDataURL(file)
  }

  function applyUrl() {
    if (!bgUrl) return
    setPreview({ type: 'image', value: bgUrl })
    onChangeBackground({ type: 'image', value: bgUrl })
  }

  return (
    <div>
      <div className="title-bar">Personalizar Fondo</div>
      <div className="panel">
        <div className="form-group">
          <label>Color de Fondo:</label>
          <div className="color-options">
            {COLORS.map(color => (
              <div
                key={color}
                className={`color-option ${selected === color ? 'selected' : ''}`}
                style={{ background: color }}
                onClick={() => applyColor(color)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="form-group">
          <label>Subir imagen desde tu ordenador:</label>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>
        <div className="form-group">
          <label>O URL de imagen:</label>
          <input
            type="text"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={bgUrl}
            onChange={e => setBgUrl(e.target.value)}
          />
          <button className="btn" style={{ marginTop: 8 }} onClick={applyUrl}>
            Aplicar Imagen
          </button>
        </div>
      </div>
      <div className="panel">
        <label style={{ fontSize: 12 }}>Vista Previa:</label>
        <div
          className="image-preview"
          style={
            preview?.type === 'color'
              ? { backgroundColor: preview.value }
              : preview?.type === 'image'
              ? { backgroundImage: `url(${preview.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}
          }
        >
          {!preview && 'Selecciona un color o imagen'}
        </div>
      </div>
    </div>
  )
}
