import type { CSSProperties } from 'react'
import ClientHeader from './ClientHeader'

interface Props {
  clientName: string
  onNavigate: (tab: 'projects' | 'schedule') => void
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif' },
  inner: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px' },
  heading: { fontSize: '22px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  sub: { fontSize: '14px', color: '#888780', marginBottom: '32px' },
  embedWrapper: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', overflow: 'hidden' },
}

export default function ScheduleCall({ clientName, onNavigate }: Props) {
  return (
    <div style={s.page}>
      <ClientHeader clientName={clientName} activeTab="schedule" onNavigate={onNavigate} />
      <div style={s.inner}>
        <div style={s.heading}>Schedule a call</div>
        <div style={s.sub}>Book a project check-in or strategy session with Ashlee.</div>
        <div style={s.embedWrapper}>
          <iframe
            src="https://app.acuityscheduling.com/schedule.php?owner=35273051&appointmentType=category:Current%20Client%20Sessions"
            width="100%"
            height="800"
            frameBorder="0"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </div>
  )
}