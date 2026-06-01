import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user
  return {
    uid: user.uid,
    nombre: user.displayName || user.email?.split('@')[0] || 'Usuario Google',
    email: user.email,
    foto: user.photoURL,
    proveedor: 'google',
  }
}

export async function socialLogin(data) {
  const res = await fetch('/api/auth/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
