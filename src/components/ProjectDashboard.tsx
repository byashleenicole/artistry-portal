import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import StageDetail from './StageDetail'
import ClientHeader from './ClientHeader'

interface Project {
  id: string
  name: string
  package_type: string
  current_stage: string
  status: string
  started_at: string
}

interface Stage {
  id: string
  name: string
  order_index: number
  status: string
  approved_at: string | null
}

interface Props {
  project: Project
  clientId: string
  clientName: string
  onBack?: () => void
  onSchedule: () => void
  onProfile: () => void
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif' },
  inner: { maxWidth: '600px', margin: '0 auto', padding: '40px 24px' },
  heading: { fontSize: '22px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  packageType: { fontSize: '14px', color: '#888780', marginBottom: '32px' },
  sectionLabel: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: '#888780', marginBottom: '12px' },
  stageCard: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '10px', padding: '16px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.15s' },
  stageName: { fontSize: '14px', fontWeight: '500', color: '#2c2c2a' },
  stageDate: { fontSize: '11px', color: '#888780', marginTop: '2px' },
  pillApproved: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e1f5ee', color: '#0f6e56', fontWeight: '500' },
  pillInProgress: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e6f1fb', color: '#185fa5', fontWeight: '500' },
  pillPending: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f1efea', color: '#888780', fontWeight: '500' },
  pillReview: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#faeeda', color: '#854f0b', fontWeight: '500' },
  progressBar: { height: '4px', borderRadius: '2px', backgroundColor: '#f1efea', overflow: 'hidden', marginBottom: '6px' },
  progressFill: { height: '100%', borderRadius: '2px', backgroundColor: '#2c2c2a' },
  progressLabel: { fontSize: '11px', color: '#888780', textAlign: 'right' as const, marginBottom: '32px' },
  emptyStages: { textAlign: 'center' as const, padding: '32px', color: '#888780', fontSize: '14px', backgroundColor: '#fff', borderRadius: '10px', border: '0.5px solid #d3d1c7' },
}

const stageOrder = ['onboarding', 'kickoff', 'concepts', 'refinement', 'final_review', 'complete']

function getProgress(stage: string): number {
  const index = stageOrder.indexOf(stage)
  if (index === -1) return 0
  return Math.round((index / (stageOrder.length - 1)) * 100)
}

function getPill(status: string) {
  switch (status) {
    case 'approved': return <span style={styles.pillApproved}>Approved</span>
    case 'in_progress': return <span style={styles.pillInProgress}>In progress</span>
    case 'in_review': return <span style={styles.pillReview}>Needs review</span>
    default: return <span style={styles.pillPending}>Pending</span>
  }
}

export default function ProjectDashboard({ project, clientId, clientName, onSchedule, onProfile }: Props) {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const progress = getProgress(project.current_stage)

  async function loadStages() {
    const { data } = await supabase
      .from('stages')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index', { ascending: true })
    setStages(data || [])
    setLoading(false)
  }

  useEffect(() => { loadStages() }, [project.id])

  if (selectedStage) {
    return (
      <StageDetail
        stage={selectedStage}
        clientId={clientId}
        clientName={clientName}
        onBack={() => {
          setSelectedStage(null)
          loadStages()
        }}
        onApproved={() => loadStages()}
        onSchedule={onSchedule}
        onProfile={onProfile}
      />
    )
  }

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
      <div style={styles.inner}>
        <div style={styles.heading}>{project.name}</div>
        <div style={styles.packageType}>{project.package_type || 'Brand project'}</div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <div style={styles.progressLabel}>{progress}% complete</div>
        <div style={styles.sectionLabel}>Project stages</div>
        {loading && <div style={styles.emptyStages}>Loading stages...</div>}
        {!loading && stages.length === 0 && (
          <div style={styles.emptyStages}>Your project stages will appear here once your designer gets things set up.</div>
        )}
        {stages.map(stage => (
          <div
            key={stage.id}
            style={styles.stageCard}
            onClick={() => setSelectedStage(stage)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#888780')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#d3d1c7')}
          >
            <div>
              <div style={styles.stageName}>{stage.name}</div>
              {stage.approved_at && (
                <div style={styles.stageDate}>Approved {new Date(stage.approved_at).toLocaleDateString()}</div>
              )}
            </div>
            {getPill(stage.status)}
          </div>
        ))}
      </div>
    </div>
  )
}