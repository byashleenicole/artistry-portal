import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { supabase } from '../../supabase'

interface Props {
  onCreated: () => void
}

const styles: Record<string, CSSProperties> = {
  sectionHeading: { fontSize: '16px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#888780', marginBottom: '32px' },
  card: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '28px 32px', marginBottom: '24px' },
  cardHeading: { fontSize: '13px', fontWeight: '500', color: '#2c2c2a', marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  label: { display: 'block', fontSize: '12px', color: '#5f5e5a', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #d3d1c7', fontSize: '14px', color: '#2c2c2a', backgroundColor: '#faf9f7', marginBottom: '16px', boxSizing: 'border-box' as const, outline: 'none' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #d3d1c7', fontSize: '14px', color: '#2c2c2a', backgroundColor: '#faf9f7', marginBottom: '16px', boxSizing: 'border-box' as const, outline: 'none' },
  button: { padding: '11px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2c2c2a', color: '#faf9f7', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  success: { fontSize: '13px', color: '#0f6e56', padding: '10px 12px', backgroundColor: '#e1f5ee', borderRadius: '8px', marginBottom: '16px' },
  error: { fontSize: '13px', color: '#a32d2d', padding: '10px 12px', backgroundColor: '#fcebeb', borderRadius: '8px', marginBottom: '16px' },
  divider: { height: '0.5px', backgroundColor: '#f1efea', margin: '24px 0' },
}

const defaultStages = [
  { name: 'Onboarding', order_index: 1 },
  { name: 'Kickoff', order_index: 2 },
  { name: 'Concepts', order_index: 3 },
  { name: 'Refinement', order_index: 4 },
  { name: 'Final review', order_index: 5 },
  { name: 'Complete', order_index: 6 },
]

export default function NewClientForm({ onCreated }: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [projectName, setProjectName] = useState('')
  const [packageType, setPackageType] = useState('Brand Identity')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      setError(authError?.message || 'Failed to create auth user')
      setLoading(false)
      return
    }

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({ full_name: fullName, email, company_name: company, auth_user_id: authData.user.id, status: 'active' })
      .select()
      .single()

    if (clientError || !clientData) {
      setError(clientError?.message || 'Failed to create client')
      setLoading(false)
      return
    }

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({ client_id: clientData.id, name: projectName, package_type: packageType, current_stage: 'onboarding', status: 'active' })
      .select()
      .single()

    if (projectError || !projectData) {
      setError(projectError?.message || 'Failed to create project')
      setLoading(false)
      return
    }

    const stagesToInsert = defaultStages.map(s => ({
      project_id: projectData.id,
      name: s.name,
      order_index: s.order_index,
      status: s.order_index === 1 ? 'in_progress' : 'pending',
    }))

    await supabase.from('stages').insert(stagesToInsert)

    setSuccess(true)
    setLoading(false)
    setFullName('')
    setEmail('')
    setCompany('')
    setPassword('')
    setProjectName('')
    setTimeout(() => { setSuccess(false); onCreated() }, 2000)
  }

  return (
    <div>
      <div style={styles.sectionHeading}>New client</div>
      <div style={styles.sub}>Creates a client account, project, and all default stages automatically.</div>

      <form onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>Client created! Redirecting...</div>}

        <div style={styles.card}>
          <div style={styles.cardHeading}>Client details</div>
          <label style={styles.label}>Full name</label>
          <input style={styles.input} value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Victoria Hope" />
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="victoria@hope360.com" />
          <label style={styles.label}>Company</label>
          <input style={styles.input} value={company} onChange={e => setCompany(e.target.value)} placeholder="Hope360 Medical" />
          <label style={styles.label}>Temporary password</label>
          <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="They can change this after login" />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeading}>First project</div>
          <label style={styles.label}>Project name</label>
          <input style={styles.input} value={projectName} onChange={e => setProjectName(e.target.value)} required placeholder="Hope360 Brand Identity" />
          <label style={styles.label}>Package type</label>
          <select style={styles.select} value={packageType} onChange={e => setPackageType(e.target.value)}>
            <option>Brand Identity</option>
            <option>Brand Refresh</option>
            <option>Web Design</option>
            <option>Brand + Web</option>
            <option>Photography</option>
            <option>Videography</option>
          </select>
        </div>

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create client + project'}
        </button>
      </form>
    </div>
  )
}