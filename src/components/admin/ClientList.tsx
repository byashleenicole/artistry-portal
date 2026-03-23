import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../supabase'

interface Client { id: string; full_name: string; email: string; company_name: string; status: string }
interface Project { id: string; client_id: string; name: string; current_stage: string; status: string }
interface Props { onManage: (clientId: string, projectId: string) => void }

const s: Record<string, CSSProperties> = {
  sectionHeading: { fontSize: '16px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#888780', marginBottom: '24px' },
  card: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '20px 24px', marginBottom: '12px' },
  clientTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' },
  clientName: { fontSize: '15px', fontWeight: '500', color: '#2c2c2a' },
  clientEmail: { fontSize: '12px', color: '#888780', marginTop: '2px' },
  statusPill: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e1f5ee', color: '#0f6e56', fontWeight: '500' },
  projectRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#faf9f7', borderRadius: '8px', marginBottom: '6px' },
  projectName: { fontSize: '13px', fontWeight: '500', color: '#2c2c2a' },
  projectStage: { fontSize: '11px', color: '#888780', marginTop: '2px' },
  manageBtn: { fontSize: '11px', padding: '4px 12px', borderRadius: '6px', border: '0.5px solid #d3d1c7', backgroundColor: '#fff', color: '#2c2c2a', cursor: 'pointer' },
  empty: { textAlign: 'center' as const, padding: '48px', color: '#888780', fontSize: '14px' },
  noProjects: { fontSize: '12px', color: '#888780', fontStyle: 'italic' },
}

export default function ClientList({ onManage }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('clients').select('*').eq('is_admin', false).order('created_at', { ascending: false })
      const { data: p } = await supabase.from('projects').select('*').order('started_at', { ascending: false })
      setClients(c || [])
      setProjects(p || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={s.empty}>Loading clients...</div>
  if (clients.length === 0) return <div style={s.empty}>No clients yet. Create your first one!</div>

  return (
    <div>
      <div style={s.sectionHeading}>All clients</div>
      <div style={s.sub}>{clients.length} client{clients.length !== 1 ? 's' : ''} total</div>
      {clients.map(client => {
        const cp = projects.filter(p => p.client_id === client.id)
        return (
          <div key={client.id} style={s.card}>
            <div style={s.clientTop}>
              <div>
                <div style={s.clientName}>{client.full_name}</div>
                <div style={s.clientEmail}>{client.email} · {client.company_name}</div>
              </div>
              <span style={s.statusPill}>{client.status}</span>
            </div>
            {cp.length === 0 && <div style={s.noProjects}>No projects yet</div>}
            {cp.map(project => (
              <div key={project.id} style={s.projectRow}>
                <div>
                  <div style={s.projectName}>{project.name}</div>
                  <div style={s.projectStage}>{project.current_stage}</div>
                </div>
                <button style={s.manageBtn} onClick={() => onManage(client.id, project.id)}>Manage</button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
