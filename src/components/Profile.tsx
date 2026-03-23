import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { supabase } from '../supabase'
import ClientHeader from './ClientHeader'

interface Props {
  clientId: string
  clientName: string
  onNavigate: (tab: 'projects' | 'schedule' | 'profile') => void
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif' },
  inner: { maxWidth: '600px', margin: '0 auto', padding: '40px 24px' },
  heading: { fontSize: '22px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  sub: { fontSize: '14px', color: '#888780', marginBottom: '32px' },
  card: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '28px 32px', marginBottom: '16px' },
  cardHeading: { fontSize: '13px', fontWeight: '500', color: '#2c2c2a', marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  label: { display: 'block', fontSize: '12px', color: '#5f5e5a', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #d3d1c7', fontSize: '14px', color: '#2c2c2a', backgroundColor: '#faf9f7', marginBottom: '16px', boxSizing: 'border-box' as const, outline: 'none' },
  inputDisabled: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #f1efea', fontSize: '14px', color: '#888780', backgroundColor: '#f1efea', marginBottom: '16px', boxSizing: 'border-box' as const, outline: 'none' },
  button: { padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2c2c2a', color: '#faf9f7', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  success: { fontSize: '13px', color: '#0f6e56', padding: '10px 12px', backgroundColor: '#e1f5ee', borderRadius: '8px', marginBottom: '16px' },
  error: { fontSize: '13px', color: '#a32d2d', padding: '10px 12px', backgroundColor: '#fcebeb', borderRadius: '8px', marginBottom: '16px' },
  hint: { fontSize: '11px', color: '#888780', marginTop: '-12px', marginBottom: '16px' },
}

export default function Profile({ clientId, clientName, onNavigate }: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
      if (data) {
        setFullName(data.full_name || '')
        setEmail(data.email || '')
        setCompany(data.company_name || '')
        setPhone(data.phone || '')
      }
    }
    load()
  }, [clientId])

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase
      .from('clients')
      .update({ full_name: fullName, company_name: company, phone })
      .eq('id', clientId)
    if (error) {
      setSaveError(error.message)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    setSaving(false)
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    setChangingPassword(false)
  }

  return (
    <div style={s.page}>
      <ClientHeader
        clientName={clientName}
        activeTab="profile"
        onNavigate={onNavigate}
      />
      <div style={s.inner}>
        <div style={s.heading}>My profile</div>
        <div style={s.sub}>Update your contact details and password.</div>

        <form onSubmit={handleSaveProfile}>
          <div style={s.card}>
            <div style={s.cardHeading}>Contact details</div>
            {saveSuccess && <div style={s.success}>Profile updated!</div>}
            {saveError && <div style={s.error}>{saveError}</div>}
            <label style={s.label}>Full name</label>
            <input style={s.input} value={fullName} onChange={e => setFullName(e.target.value)} />
            <label style={s.label}>Email</label>
            <input style={s.inputDisabled} value={email} disabled />
            <div style={s.hint}>Email cannot be changed here. Contact your designer.</div>
            <label style={s.label}>Company</label>
            <input style={s.input} value={company} onChange={e => setCompany(e.target.value)} />
            <label style={s.label}>Phone</label>
            <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
            <button style={s.button} type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        <form onSubmit={handleChangePassword}>
          <div style={s.card}>
            <div style={s.cardHeading}>Change password</div>
            {passwordSuccess && <div style={s.success}>Password updated successfully!</div>}
            {passwordError && <div style={s.error}>{passwordError}</div>}
            <label style={s.label}>New password</label>
            <input style={s.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
            <label style={s.label}>Confirm new password</label>
            <input style={s.input} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
            <button style={s.button} type="submit" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}