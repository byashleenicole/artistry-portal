import { useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import { supabase } from './supabase'
import ProjectSelector from './components/ProjectSelector'
import ProjectDashboard from './components/ProjectDashboard'

interface Client {
  id: string
  full_name: string
}

interface Project {
  id: string
  name: string
  package_type: string
  current_stage: string
  status: string
  started_at: string
}

type Screen = 'login' | 'projects' | 'dashboard'

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
}

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('login')
  const [client, setClient] = useState<Client | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('id, full_name')
      .eq('auth_user_id', data.user.id)
      .single()

    if (clientData) {
      setClient(clientData)
      setScreen('projects')
    } else {
      setError('No client account found for this email.')
    }

    setLoading(false)
  }

  if (screen === 'projects' && client) {
    return (
      <ProjectSelector
        clientId={client.id}
        clientName={client.full_name}
        onSelectProject={(project) => {
          setSelectedProject(project)
          setScreen('dashboard')
        }}
      />
    )
  }

  if (screen === 'dashboard' && client && selectedProject) {
    return (
      <ProjectDashboard
        project={selectedProject}
        clientId={client.id}
        clientName={client.full_name}
        onBack={() => setScreen('projects')}
      />
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