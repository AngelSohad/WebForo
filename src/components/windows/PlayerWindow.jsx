import { useState, useRef } from 'react'

export default function PlayerWindow() {
  const [audioUrl, setAudioUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [mode, setMode] = useState('none') // 'none' | 'mp3' | 'youtube'
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [duration, setDuration] = useState('0:00')
  const [volume, setVolume] = useState(100)
  const [youtubeEmbed, setYoutubeEmbed] = useState('')
  const audioRef = useRef(null)

  function formatTime(secs) {
    if (isNaN(secs)) return '0:00'
    return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`
  }

  function loadAudio() {
    if (!audioUrl) return
    setMode('mp3')
    setPlaying(false)
    setProgress(0)
    setCurrentTime('0:00')
  }

  function extractYouTubeId(url) {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return m ? m[1] : null
  }

  function loadYouTube() {
    if (!youtubeUrl) { alert('Por favor, introduce una URL de YouTube.'); return }
    const id = extractYouTubeId(youtubeUrl)
    if (!id) { alert('URL de YouTube no válida.'); return }
    setYoutubeEmbed(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`)
    setMode('youtube')
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play()
      setPlaying(true)
    } else {
      audioRef.current.pause()
      setPlaying(false)
    }
  }

  function stopAudio() {
    if (mode === 'youtube') {
      setYoutubeEmbed('')
      setMode('mp3')
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaying(false)
    setProgress(0)
    setCurrentTime('0:00')
  }

  function handleTimeUpdate() {
    const a = audioRef.current
    if (!a || !a.duration) return
    setProgress((a.currentTime / a.duration) * 100)
    setCurrentTime(formatTime(a.currentTime))
  }

  function handleLoadedMetadata() {
    setDuration(formatTime(audioRef.current?.duration))
  }

  function handleVolumeChange(e) {
    const v = Number(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v / 100
  }

  return (
    <div>
      <div className="title-bar">Reproductor de Audio</div>
      <div className="panel">
        <div className="form-group">
          <label>URL del audio (MP3):</label>
          <input
            type="text"
            placeholder="https://ejemplo.com/musica.mp3"
            value={audioUrl}
            onChange={e => setAudioUrl(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>URL de YouTube:</label>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
          />
        </div>
        <div className="btn-group" style={{ marginTop: 8 }}>
          <button className="btn" onClick={loadAudio}>Cargar MP3</button>
          <button className="btn" onClick={loadYouTube}>Cargar YouTube</button>
        </div>
      </div>

      {mode === 'mp3' && (
        <div className="panel">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setPlaying(false)}
            style={{ display: 'none' }}
          />
          <div className="audio-controls">
            <div className="audio-player">
              <button className="btn play-btn" onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
              <button className="btn" onClick={stopAudio}>⏹</button>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="audio-player" style={{ justifyContent: 'space-between' }}>
              <span className="time-display">{currentTime}</span>
              <span className="time-display">Vol: {volume}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                style={{ width: 100 }}
                onChange={handleVolumeChange}
              />
              <span className="time-display">{duration}</span>
            </div>
          </div>
        </div>
      )}

      {mode === 'youtube' && youtubeEmbed && (
        <div className="panel">
          <iframe
            src={youtubeEmbed}
            width="100%"
            height="200"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={stopAudio}>⏹ Detener</button>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
        Consejo: Puedes usar enlaces de archivos MP3 públicos o URLs de YouTube.
      </p>
    </div>
  )
}
