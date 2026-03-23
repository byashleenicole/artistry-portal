import { useState } from 'react'
import type { CSSProperties } from 'react'
import ClientList from './admin/ClientList'
import NewClientForm from './admin/NewClientForm'
import ManageProject from './admin/ManageProject'

interface Props {
  adminEmail: string
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif' },
  header: { borderBottom: '0.5px solid #d3d1c7', backgroundColor: '#fff', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '13px', fontWeight: '500', letterSpacing: '0.04em', color: '#2c2c2a' },
  adminBadge: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f1efea', color: '#5f5e5a' },
  nav: { display: 'flex', gap: '4px', padding: '16px 32px', borderBottom: '0.5px solid #f1efea' },
  navBtn: { fontSize: '13px', padding: '7px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#888780', cursor: 'pointer' },
  navBtnActive: { fontSize: '13px', padding: '7px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#f1efea', color: '#2c2c2a', cursor: 'pointer', fontWeight: '500' },
  body: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
}

type Tab = 'clients' | 'new-client' | 'manage'

export default function AdminDashboard({ adminEmail }: Props) {
  const [tab, setTab] = useState<Tab>('clients')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  function navStyle(t: Tab) {
    return tab === t ? styles.navBtnActive : styles.navBtn
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>Artistry Studios® — Admin</div>
        <div style={styles.adminBadge}>{adminEmail}</div>
      </div>
      <div style={styles.nav}>
        <button style={navStyle('clients')} onClick={() => setTab('clients')}>All clients</button>
        <button style={navStyle('new-client')} onClick={() => setTab('new-client')}>New client</button>
        {selectedClientId && selectedProjectId && (
          <button style={navStyle('manage')} onClick={() => setTab('manage')}>Manage project</button>
        )}
      </div>
      <div style={styles.body}>
        {tab === 'clients' && (
          <ClientList
            onManage={(clientId, projectId) => {
              setSelectedClientId(clientId)
              setSelectedProjectId(projectId)
              setTab('manage')
            }}
          />
        )}
        {tab === 'new-client' && (
          <NewClientForm onCreated={() => setTab('clients')} />
        )}
        {tab === 'manage' && selectedClientId && selectedProjectId && (
          <ManageProject
            clientId={selectedClientId}
            projectId={selectedProjectId}
            onBack={() => setTab('clients')}
          />
        )}
      </div>
    </div>
  )
}