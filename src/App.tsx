import { useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import { supabase } from './supabase'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf9f7',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    border: '0.5px solid #d3d1c7',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '380px',
  },
  eyebrow: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#888780',
    marginBottom: '8px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '500',
    color: '#2c2c2a',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '14px',
    color: '#888780',
    marginBottom: '32px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#5f5e5a',
    marginBottom: '6px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '0.5px solid #d3d1c7',
    fontSize: '14px',
    color: '#2c2c2a',
    backgroundColor: '#faf9f7',
    marginBottom: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2c2c2a',
    color: '#faf9f7',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    fontSize: '13px',
    color: '#a32d2d',
    marginBottom: '12px',
    padding: '10px 12px',
    backgroundColor: '#fcebeb',
    borderRadius: '8px',
  },
  success: {
    fontSize: '13px',
    color: '#0f6e56',
    marginBottom: '12px',
    padding: '10px 12px',
    backgroundColor: '#e1f5ee',
    borderRadius: '8px',
  },
}

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [clientName, setClientName] = useState('')

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('full_name')
      .eq('auth_user_id', data.user.id)
      .single()

    setClientName(clientData?.full_name || 'there')
    setLoggedIn(true)
    setLoading(false)
  }

  if (loggedIn) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.eyebrow}>Artistry Studios®</div>
          <div style={styles.heading}>Welcome, {clientName}</div>
          <div style={styles.sub}>Your project portal is loading...</div>
          <div style={styles.success}>
            Login successful! Dashboard coming next session.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>Artistry Studios®</div>
        <div style={styles.heading}>Your brand, delivered.</div>
        <div style={styles.sub}>Sign in to access your project portal</div>

        <form onSubmit={handleLogin}>
          {error && <div style={styles.error}>{error}</div>}
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ fontSize: '11px', color: '#888780', textAlign: 'center', marginTop: '16px' }}>
          Only active clients have access
        </div>
      </div>
    </div>
  )
}