import type { CSSProperties } from 'react'
import { supabase } from '../supabase'

interface Props {
  clientName: string
  activeTab?: 'projects' | 'schedule' | 'profile'
  onNavigate?: (tab: 'projects' | 'schedule' | 'profile') => void
}

const s: Record<string, CSSProperties> = {
  header: { backgroundColor: '#fff', borderBottom: '0.5px solid #d3d1c7', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', fontFamily: 'system-ui, sans-serif' },
  logo: { fontSize: '13px', fontWeight: '500', letterSpacing: '0.04em', color: '#2c2c2a' },
  right: { display: 'flex', alignItems: 'center', gap: '8px' },
  name: { fontSize: '12px', color: '#888780' },
  logoutBtn: { fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '0.5px solid #d3d1c7', backgroundColor: 'transparent', color: '#888780', cursor: 'pointer' },
  nav: { display: 'flex', gap: '4px', padding: '0 32px', borderBottom: '0.5px solid #f1efea', backgroundColor: '#fff', fontFamily: 'system-ui, sans-serif' },
  navBtn: { fontSize: '13px', padding: '10px 16px', border: 'none', backgroundColor: 'transparent', color: '#888780', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  navBtnActive: { fontSize: '13px', padding: '10px 16px', border: 'none', backgroundColor: 'transparent', color: '#2c2c2a', cursor: 'pointer', fontWeight: '500', borderBottom: '2px solid #2c2c2a', marginBottom: '-1px' },
}

async function handleLogout() {
  await supabase.auth.signOut()
  window.location.reload()
}

export default function ClientHeader({ clientName, activeTab, onNavigate }: Props) {
  return (
    <div>
      <div style={s.header}>
        <div style={s.logo}>Artistry Studios®</div>
        <div style={s.right}>
          <span style={s.name}>Hi, {clientName.split(' ')[0]}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Log out</button>
        </div>
      </div>
      {onNavigate && (
        <div style={s.nav}>
          <button
            style={activeTab === 'projects' ? s.navBtnActive : s.navBtn}
            onClick={() => onNavigate('projects')}
          >
            My projects
          </button>
          <button
            style={activeTab === 'schedule' ? s.navBtnActive : s.navBtn}
            onClick={() => onNavigate('schedule')}
          >
            Schedule a call
          </button>
          <button
  style={activeTab === 'profile' ? s.navBtnActive : s.navBtn}
  onClick={() => onNavigate('profile')}
>
  My profile
</button>
        </div>
      )}
    </div>
  )
}