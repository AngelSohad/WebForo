import { useState } from 'react'

const INITIAL_NEWS = [
  { id: 1, title: '🚀 Nuevo Lenguaje de Programación revoluciona la industria', text: 'Los desarrolladores están adoptando rápidamente esta nueva tecnología que promete mayor eficiencia y mejor rendimiento.', date: 'Hace 2 horas' },
  { id: 2, title: '🤖 IA generativa alcanza nuevos hitos en 2026', text: 'Los últimos avances en inteligencia artificial están transformando múltiples sectores desde healthcare hasta finanzas.', date: 'Hace 4 horas' },
  { id: 3, title: '🔒 Nuevo fallo de seguridad afecta a millones', text: 'Expertos recomiendan actualizar todos los sistemas inmediatamente para mitigar vulnerabilidades críticas.', date: 'Ayer' },
  { id: 4, title: '💻 Windows 12: Todo lo que sabemos hasta ahora', text: 'Se filtran detalles sobre el próximo sistema operativo de Microsoft y sus nuevas características.', date: 'Hace 2 días' },
  { id: 5, title: '☁️ Computación cuántica más accesible que nunca', text: 'Nuevas plataformas en la nube permiten a empresas experimentar con computación cuántica sin grandes inversiones.', date: 'Hace 3 días' },
]

const MORE_NEWS = [
  { id: 6, title: '🌐 Internet celebra 35 años de la World Wide Web', text: 'Tim Berners-Lee reflexiona sobre el impacto transformador de su creación en la sociedad moderna.', date: 'Hace 4 días' },
  { id: 7, title: '📱 Los smartphones plegables dominan el mercado', text: 'Las principales marcas presentan sus nuevos modelos con pantallas más resistentes y flexibles.', date: 'Hace 5 días' },
  { id: 8, title: '🎓 Universidad lanza curso gratuito de programación', text: 'Más de 50,000 estudiantes ya se han inscrito en el nuevo programa de ciencias de la computación.', date: 'Hace 6 días' },
  { id: 9, title: '☁️ Nuevo estándar de criptografía cuántica', text: 'Investigadores desarrollan un algoritmo que podría proteger contra futuros ataques de computadoras cuánticas.', date: 'Hace 1 semana' },
  { id: 10, title: '🚀 SpaceX lanza constelación de satélites educativos', text: 'El proyecto busca proporcionar internet de alta velocidad a escuelas en zonas rurales de todo el mundo.', date: 'Hace 1 semana' },
]

export default function NewsWindow() {
  const [news, setNews] = useState(INITIAL_NEWS)
  const [moreIdx, setMoreIdx] = useState(0)
  const [noMore, setNoMore] = useState(false)

  function loadMore() {
    const toAdd = MORE_NEWS.slice(moreIdx, moreIdx + 3)
    if (toAdd.length === 0) return
    setNews(prev => [...prev, ...toAdd])
    const nextIdx = moreIdx + 3
    setMoreIdx(nextIdx)
    if (nextIdx >= MORE_NEWS.length) setNoMore(true)
  }

  return (
    <div>
      <div className="title-bar">Últimas Noticias</div>
      <div className="noticias-container">
        {news.map(n => (
          <div key={n.id} className="noticia-item">
            <h4>{n.title}</h4>
            <p>{n.text}</p>
            <div className="fecha">{n.date}</div>
          </div>
        ))}
      </div>
      <div className="btn-group" style={{ marginTop: 15 }}>
        <button className="btn" onClick={loadMore} disabled={noMore}>
          {noMore ? 'No hay más noticias' : 'Cargar Más Noticias'}
        </button>
      </div>
    </div>
  )
}
