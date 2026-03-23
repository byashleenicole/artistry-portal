import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../supabase'

interface Project {
  id: string
  name: string
  package_type: string
}

interface Asset {
  id: string
  label: string
  file_type: string
  drive_url: string
  version: string
}

interface Props {
  project: Project
  clientName: string
  onSubmitSurvey: () => void
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif', padding: '40px 24px' },
  inner: { maxWidth: '600px', margin: '0 auto' },
  celebration: { textAlign: 'center', padding: '48px 0 40px', borderBottom: '0.5px solid #f1efea', marginBottom: '40px' },
  check: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '22px' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888780', marginBottom: '8px' },
  heading: { fontSize: '28px', fontWeight: '500', color: '#2c2c2a', marginBottom: '8px' },
  sub: { fontSize: '15px', color: '#888780', lineHeight: 1.6 },
  sectionLabel: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: '#888780', marginBottom: '12px' },
  assetRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '10px', marginBottom: '8px' },
  assetLabel: { fontSize: '14px', fontWeight: '500', color: '#2c2c2a' },
  assetMeta: { fontSize: '11px', color: '#888780', marginTop: '2px' },
  fileTag: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f1efea', color: '#5f5e5a', fontWeight: '500', marginRight: '8px' },
  downloadLink: { fontSize: '12px', color: '#185fa5', textDecoration: 'none' },
  surveyCard: { marginTop: '40px', backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '28px 32px' },
  surveyHeading: { fontSize: '16px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  surveySub: { fontSize: '13px', color: '#888780', marginBottom: '24px' },
  label: { display: 'block', fontSize: '12px', color: '#5f5e5a', marginBottom: '6px', fontWeight: '500' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #d3d1c7', fontSize: '14px', color: '#2c2c2a', backgroundColor: '#faf9f7', resize: 'vertical' as const, minHeight: '100px', boxSizing: 'border-box' as const, fontFamily: 'system-ui, sans-serif', outline: 'none', marginBottom: '16px' },
  stars: { display: 'flex', gap: '8px', marginBottom: '20px' },
  star: { fontSize: '24px', cursor: 'pointer', transition: 'transform 0.1s' },
  submitBtn: { padding: '11px 28px', borderRadius: '8px', border: 'none', backgroundColor: '#2c2c2a', color: '#faf9f7', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  thankYou: { textAlign: 'center' as const, padding: '32px', backgroundColor: '#e1f5ee', borderRadius: '12px', marginTop: '40px' },
  thankYouHeading: { fontSize: '18px', fontWeight: '500', color: '#0f6e56', marginBottom: '8px' },
  thankYouSub: { fontSize: '14px', color: '#0f6e56' },
}

export default function Offboarding({ project, clientName, onSubmitSurvey }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [testimonial, setTestimonial] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadAssets() {
      const { data: stages } = await supabase
        .from('stages')
        .select('id')
        .eq('project_id', project.id)

      if (!stages) return

      const stageIds = stages.map(s => s.id)
      const { data } = await supabase
        .from('assets')
        .select('*')
        .in('stage_id', stageIds)
        .order('uploaded_at', { ascending: true })

      setAssets(data || [])
    }
    loadAssets()
  }, [project.id])

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)
    await supabase.from('notifications').insert({
      project_id: project.id,
      trigger_event: 'exit_survey',
      channel: 'internal',
      sent: true,
      sent_at: new Date().toISOString(),
    })
    setSubmitted(true)
    setSubmitting(false)
    onSubmitSurvey()
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <div style={styles.celebration}>
          <div style={styles.check}>✓</div>
          <div style={styles.eyebrow}>Artistry Studios®</div>
          <div style={styles.heading}>Your brand is complete!</div>
          <div style={styles.sub}>
            Congratulations, {clientName}. Every deliverable for <strong>{project.name}</strong> is ready for download below.
          </div>
        </div>

        <div style={styles.sectionLabel}>Your final assets</div>

        {assets.length === 0 && (
          <div style={{ fontSize: '13px', color: '#888780', padding: '20px', textAlign: 'center' }}>
            Assets are being prepared. Check back shortly!
          </div>
        )}

        {assets.map(asset => (
          <div key={asset.id} style={styles.assetRow}>
            <div>
              <div style={styles.assetLabel}>{asset.label}</div>
              <div style={styles.assetMeta}>{asset.version}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={styles.fileTag}>{asset.file_type}</span>
              {asset.drive_url && (
                <a href={asset.drive_url} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                  Download
                </a>
              )}
            </div>
          </div>
        ))}

        {!submitted ? (
          <div style={styles.surveyCard}>
            <div style={styles.surveyHeading}>How was your experience?</div>
            <div style={styles.surveySub}>Your feedback helps Artistry Studios keep growing.</div>

            <label style={styles.label}>Rating</label>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  style={{ ...styles.star, color: n <= (hovered || rating) ? '#EF9F27' : '#d3d1c7' }}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <label style={styles.label}>Share your experience (optional)</label>
            <textarea
              style={styles.textarea}
              placeholder="What did you love about working with Artistry Studios?"
              value={testimonial}
              onChange={e => setTestimonial(e.target.value)}
            />

            <button
              style={{ ...styles.submitBtn, opacity: rating ? 1 : 0.5 }}
              onClick={handleSubmit}
              disabled={!rating || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </button>
          </div>
        ) : (
          <div style={styles.thankYou}>
            <div style={styles.thankYouHeading}>Thank you, {clientName}!</div>
            <div style={styles.thankYouSub}>Your feedback means the world. Wishing you all the best with your new brand!</div>
          </div>
        )}
      </div>
    </div>
  )
}