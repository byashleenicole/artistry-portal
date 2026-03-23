import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../supabase'

interface Stage { id: string; name: string; order_index: number; status: string }
interface Props { clientId: string; projectId: string; onBack: () => void }

const s: Record<string, CSSProperties> = {
  back: { fontSize: '12px', color: '#888780', cursor: 'pointer', marginBottom: '24px', display: 'inline-block' },
  sectionHeading: { fontSize: '16px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#888780', marginBottom: '24px' },
  card: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' },
  cardHeading: { fontSize: '13px', fontWeight: '500', color: '#2c2c2a', marginBottom: '16px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  stageRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #f1efea' },
  stageName: { fontSize: '14px', color: '#2c2c2a', fontWeight: '500' },
  sel: { fontSize: '12px', padding: '5px 10px', borderRadius: '6px', border: '0.5px solid #d3d1c7', backgroundColor: '#faf9f7', color: '#2c2c2a', outline: 'none' },
  label: { display: 'block', fontSize: '12px', color: '#5f5e5a', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #d3d1c7', fontSize: '14px', color: '#2c2c2a', backgroundColor: '#faf9f7', marginBottom: '12px', boxSizing: 'border-box' as const, outline: 'none' },
  addBtn: { padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2c2c2a', color: '#faf9f7', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  completeBtn: { padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0f6e56', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  success: { fontSize: '13px', color: '#0f6e56', padding: '10px 12px', backgroundColor: '#e1f5ee', borderRadius: '8px', marginBottom: '12px' },
  completeBanner: { padding: '16px 24px', backgroundColor: '#e1f5ee', borderRadius: '12px', fontSize: '13px', color: '#0f6e56', fontWeight: '500', marginBottom: '16px' },
}

const stageStatuses = ['pending', 'in_progress', 'in_review', 'approved']

export default function ManageProject({ projectId, onBack }: Props) {
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [assetLabel, setAssetLabel] = useState('')
  const [assetUrl, setAssetUrl] = useState('')
  const [assetType, setAssetType] = useState('PNG')
  const [assetVersion, setAssetVersion] = useState('v1')
  const [selectedStageId, setSelectedStageId] = useState('')
  const [assetSuccess, setAssetSuccess] = useState(false)
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: pd } = await supabase.from('projects').select('*').eq('id', projectId).single()
      setProject(pd)
      const { data: sd } = await supabase.from('stages').select('*').eq('project_id', projectId).order('order_index', { ascending: true })
      setStages(sd || [])
      if (sd && sd.length > 0) setSelectedStageId(sd[0].id)
      setLoading(false)
    }
    load()
  }, [projectId])

  async function updateStageStatus(stageId: string, status: string) {
    await supabase.from('stages').update({ status }).eq('id', stageId)
    setStages(prev => prev.map(st => st.id === stageId ? { ...st, status } : st))
    const activeStage = stages.find(st => st.id === stageId)
    if (activeStage && status === 'in_progress') {
      await supabase.from('projects').update({ current_stage: activeStage.name.toLowerCase().replace(/ /g, '_') }).eq('id', projectId)
    }
  }

  async function addAsset() {
    if (!assetLabel.trim() || !selectedStageId) return
    await supabase.from('assets').insert({ stage_id: selectedStageId, label: assetLabel.trim(), file_type: assetType, drive_url: assetUrl.trim(), version: assetVersion })
    setAssetLabel(''); setAssetUrl(''); setAssetVersion('v1')
    setAssetSuccess(true)
    setTimeout(() => setAssetSuccess(false), 2500)
  }

  async function handleComplete() {
    await supabase.from('projects').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', projectId)
    await supabase.from('stages').update({ status: 'approved' }).eq('project_id', projectId)
    setProject((prev: any) => ({ ...prev, status: 'completed' }))
    setStages(prev => prev.map(st => ({ ...st, status: 'approved' })))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={s.back} onClick={onBack}>Back to clients</div>
      <div style={s.sectionHeading}>{project?.name}</div>
      <div style={s.sub}>{project?.package_type}</div>
      {project?.status === 'completed' && (
        <div style={s.completeBanner}>Project marked complete. Client is in offboarding.</div>
      )}
      <div style={s.card}>
        <div style={s.cardHeading}>Stage status</div>
        {stages.map(stage => (
          <div key={stage.id} style={s.stageRow}>
            <div style={s.stageName}>{stage.name}</div>
            <select style={s.sel} value={stage.status} onChange={e => updateStageStatus(stage.id, e.target.value)}>
              {stageStatuses.map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        ))}
      </div>
      {project?.status !== 'completed' && (
        <div style={s.card}>
          <div style={s.cardHeading}>Complete project</div>
          <div style={{ fontSize: '12px', color: '#888780', marginBottom: '16px' }}>This triggers the offboarding flow for your client.</div>
          <button style={s.completeBtn} onClick={handleComplete}>Complete this project</button>
        </div>
      )}
      <div style={s.card}>
        <div style={s.cardHeading}>Add asset</div>
        {assetSuccess && <div style={s.success}>Asset added!</div>}
        <label style={s.label}>Stage</label>
        <select style={{ ...s.input, marginBottom: '12px' }} value={selectedStageId} onChange={e => setSelectedStageId(e.target.value)}>
          {stages.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
        </select>
        <label style={s.label}>Asset label</label>
        <input style={s.input} value={assetLabel} onChange={e => setAssetLabel(e.target.value)} placeholder="Hope360 Primary Logo" />
        <label style={s.label}>Google Drive URL</label>
        <input style={s.input} value={assetUrl} onChange={e => setAssetUrl(e.target.value)} placeholder="https://drive.google.com/..." />
        <label style={s.label}>File type</label>
        <select style={{ ...s.input, marginBottom: '12px' }} value={assetType} onChange={e => setAssetType(e.target.value)}>
          {['SVG', 'PNG', 'PDF', 'JPG', 'ZIP', 'AI', 'MP4'].map(t => <option key={t}>{t}</option>)}
        </select>
        <label style={s.label}>Version</label>
        <input style={s.input} value={assetVersion} onChange={e => setAssetVersion(e.target.value)} placeholder="v1" />
        <button style={s.addBtn} onClick={addAsset}>Add asset</button>
      </div>
    </div>
  )
}