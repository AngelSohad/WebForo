import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Desktop from './pages/Desktop'
import Admin from './pages/Admin'
import MpReturn from './pages/MpReturn'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Desktop />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mp/success" element={<MpReturn />} />
          <Route path="/mp/failure" element={<MpReturn />} />
          <Route path="/mp/pending" element={<MpReturn />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
