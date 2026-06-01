const FOROS = [
  { emoji: '💻', title: 'Programación',      sub: 'Stack Overflow',         url: 'https://stackoverflow.com/' },
  { emoji: '🖥️', title: 'Hardware',          sub: 'Reddit Hardware',        url: 'https://www.reddit.com/r/hardware/' },
  { emoji: '🔒', title: 'Ciberseguridad',    sub: 'Reddit Cybersecurity',   url: 'https://www.reddit.com/r/cybersecurity/' },
  { emoji: '🌐', title: 'Redes',             sub: 'Reddit Networking',      url: 'https://www.reddit.com/r/networking/' },
  { emoji: '📊', title: 'Ciencia de Datos',  sub: 'Reddit Data Science',    url: 'https://www.reddit.com/r/DataScience/' },
  { emoji: '🐧', title: 'Linux',             sub: 'Reddit Linux',           url: 'https://www.reddit.com/r/linux/' },
  { emoji: '🎮', title: 'Desarrollo Juegos', sub: 'Reddit Game Dev',        url: 'https://www.reddit.com/r/gamedev/' },
  { emoji: '🤖', title: 'Inteligencia IA',   sub: 'Reddit AI',              url: 'https://www.reddit.com/r/ArtificialIntelligence/' },
]

export default function ForumWindow() {
  return (
    <div>
      <div className="title-bar">Selecciona un tema de interés</div>
      <div className="foros-grid">
        {FOROS.map(foro => (
          <div
            key={foro.url}
            className="foro-item"
            onClick={() => window.open(foro.url, '_blank')}
          >
            <div>{foro.emoji} {foro.title}</div>
            <small>{foro.sub}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
