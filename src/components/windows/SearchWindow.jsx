import { useState } from 'react'

export default function SearchWindow() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(null)

  function handleSearch() {
    if (!query) return
    setStatus('searching')
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
    setTimeout(() => setStatus('done'), 500)
  }

  return (
    <div>
      <div className="title-bar">Buscar en la Web</div>
      <div className="panel">
        <div className="form-group">
          <label>¿Qué deseas buscar?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Escribe aquí..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn" onClick={handleSearch}>Buscar</button>
          </div>
        </div>
      </div>
      <div className="search-results">
        {!status && <p style={{ color: '#888' }}>Los resultados de búsqueda se abrirán en una nueva pestaña.</p>}
        {status === 'searching' && <p style={{ color: '#666' }}>Buscando: {query}...</p>}
        {status === 'done' && (
          <>
            <p style={{ color: '#008000' }}>✓ Búsqueda iniciada en Google</p>
            <p style={{ color: '#888', marginTop: 8 }}>La búsqueda se ha abierto en una nueva pestaña del navegador.</p>
          </>
        )}
      </div>
      <p style={{ fontSize: 11, color: '#666', marginTop: 8 }}>Usa Google para buscar en internet.</p>
    </div>
  )
}
