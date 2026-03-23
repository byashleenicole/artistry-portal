import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../supabase'
import ClientHeader from './ClientHeader'

interface Project {
  id: string
  name: string
  package_type: string
  current_stage: string
  status: string
  started_at: string
}

interface Props {
  clientId: string
  clientName: string
  onSelectProject: (project: Project) => void
  onSchedule: () => void
  onProfile: () => void
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif' },
  card: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '20px 24px', marginBottom: '12px', cursor: 'pointer', transition: 'border-color 0.15s' },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' },
  projectName: { fontSize: '16px', fontWeight: '500', color: '#2c2c2a' },
  packageType: { fontSize: '12px', color: '#888780' },
  stagePill: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e1f5ee', color: '#0f6e56', fontWeight: '500', whiteSpace: 'nowrap' as const },
  progressBar: { height: '4px', borderRadius: '2px', backgroundColor: '#f1efea', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px', backgroundColor: '#2c2c2a', transition: 'width 0.3s ease' },
  progressLabel: { fontSize: '11px', color: '#888780', marginTop: '6px', textAlign: 'right' as const },
  empty: { textAlign: 'center' as const, padding: '48px 24px', color: '#888780', fontSize: '14px' },
  loading: { textAlign: 'center' as const, padding: '48px 24px', color: '#888780', fontSize: '14px' },
  sub: { fontSize: '14px', color: '#888780', marginBottom: '24px' },
}

const stageOrder = ['onboarding', 'kickoff', 'concepts', 'refinement', 'final_review', 'complete']

function getProgress(stage: string): number {
  const index = stageOrder.indexOf(stage)
  if (index === -1) return 0
  return Math.round((index / (stageOrder.length - 1)) * 100)
}

function formatStage(stage: string): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function ProjectSelector({ clientId, clientName, onSelectProject, onSchedule, onProfile }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('started_at', { ascending: false })
      setProjects(data || [])
      setLoading(false)
    }
    loadProjects()
  }, [clientId])

  return (
    <div style={styles.page}>
      <ClientHeader
        clientName={clientName}
        activeTab="projects"
        onNavigate={(tab) => {
          if (tab === 'schedule') onSchedule()
          if (tab === 'profile') onProfile()
        }}
      />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={styles.sub}>Select a project to view your portal</div>
        {loading && <div style={styles.loading}>Loading your projects...</div>}
        {!loading && projects.length === 0 && (
          <div style={styles.empty}>No active projects yet. Your designer will set things up shortly.</div>
        )}
        {projects.map(project => {
          const progress = getProgress(project.current_stage)
          return (
            <div
              key={project.id}
              style={styles.card}
              onClick={() => onSelectProject(project)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#888780')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#d3d1c7')}
            >
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.projectName}>{project.name}</div>
                  <div style={styles.packageType}>{project.package_type || 'Brand project'}</div>
                </div>
                <div style={styles.stagePill}>{formatStage(project.current_stage)}</div>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.progressLabel}>{progress}% complete</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}