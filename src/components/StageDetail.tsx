import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../supabase'

interface Stage {
  id: string
  name: string
  order_index: number
  status: string
  approved_at: string | null
}

interface Asset {
  id: string
  label: string
  file_type: string
  drive_url: string
  version: string
  uploaded_at: string
}

interface Comment {
  id: string
  body: string
  type: string
  resolved: boolean
  created_at: string
}

interface Props {
  stage: Stage
  clientId: string
  onBack: () => void
  onApproved: () => void
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#faf9f7', fontFamily: 'system-ui, sans-serif', padding: '40px 24px' },
  inner: { maxWidth: '600px', margin: '0 auto' },
  back: { fontSize: '12px', color: '#888780', cursor: 'pointer', marginBottom: '24px', display: 'inline-block' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '8px' },
  heading: { fontSize: '22px', fontWeight: '500', color: '#2c2c2a', marginBottom: '4px' },
  stageMeta: { fontSize: '14px', color: '#888780', marginBottom: '32px' },
  sectionLabel: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#888780', marginBottom: '12px', marginTop: '32px' },
  assetCard: { backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  assetHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  assetLabel: { fontSize: '15px', fontWeight: '500', color: '#2c2c2a' },
  assetMeta: { fontSize: '11px', color: '#888780', marginTop: '2px' },
  fileTag: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f1efea', color: '#5f5e5a', fontWeight: '500' },
  downloadBtn: { display: 'inline-block', marginTop: '12px', fontSize: '12px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid #d3d1c7', color: '#2c2c2a', textDecoration: 'none', backgroundColor: '#faf9f7', cursor: 'pointer' },
  divider: { height: '0.5px', backgroundColor: '#f1efea', margin: '16px 0' },
  commentLabel: { fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#888780', marginBottom: '10px' },
  commentItem: { padding: '10px 12px', borderRadius: '8px', backgroundColor: '#faf9f7', marginBottom: '8px', border: '0.5px solid #f1efea' },
  commentBody: { fontSize: '13px', color: '#2c2c2a', lineHeight: 1.5 },
  commentMeta: { fontSize: '11px', color: '#888780', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' },
  revisionTag: { fontSize: '10px', padding: '2px 7px', borderRadius: '10px', backgroundColor: '#faeeda', color: '#854f0b', fontWeight: '500' },
  resolvedTag: { fontSize: '10px', padding: '2px 7px', borderRadius: '10px', backgroundColor: '#e1f5ee', color: '#0f6e56', fontWeight: '500' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #d3d1c7', fontSize: '13px', color: '#2c2c2a', backgroundColor: '#faf9f7', resize: 'vertical' as const, minHeight: '80px', boxSizing: 'border-box' as const, fontFamily: 'system-ui, sans-serif', outline: 'none', marginBottom: '8px' },
  commentActions: { display: 'flex', gap: '8px' },
  noteBtn: { fontSize: '12px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid #d3d1c7', backgroundColor: '#fff', color: '#2c2c2a', cursor: 'pointer' },
  revisionBtn: { fontSize: '12px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid #e8c97a', backgroundColor: '#faeeda', color: '#854f0b', cursor: 'pointer' },
  approveSection: { marginTop: '40px', padding: '24px', backgroundColor: '#fff', border: '0.5px solid #d3d1c7', borderRadius: '12px', textAlign: 'center' as const },
  approveHeading: { fontSize: '15px', fontWeight: '500', color: '#2c2c2a', marginBottom: '6px' },
  approveSub: { fontSize: '13px', color: '#888780', marginBottom: '16px' },
  approveBtn: { padding: '11px 32px', borderRadius: '8px', border: 'none', backgroundColor: '#0f6e56', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  approvedBanner: { marginTop: '40px', padding: '20px 24px', backgroundColor: '#e1f5ee', borderRadius: '12px', textAlign: 'center' as const, fontSize: '14px', color: '#0f6e56', fontWeight: '500' },
  emptyAssets: { textAlign: 'center' as const, padding: '32px', color: '#888780', fontSize: '14px', backgroundColor: '#fff', borderRadius: '12px', border: '0.5px solid #d3d1c7' },
}
