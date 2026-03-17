'use client'
import { useEffect } from 'react'
import { ColInfo } from '@/lib/store'

interface Props {
  row: Record<string, string>
  selCols: ColInfo[]
  onClose: () => void
}

export default function RecordModal({ row, selCols, onClose }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  const cols   = selCols.map(c => c.name)
  const idCol  = cols.find(c => /N_AIH|IDENT|AIH|^ID/i.test(c)) || cols[0]
  const title  = `Registro — ${idCol}: ${row[idCol] || '—'}`
  const sub    = cols.slice(0, 3).map(c => `${c}: ${row[c] || '—'}`).join(' · ')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full sm:max-w-3xl flex flex-col overflow-hidden"
        style={{
          background:'var(--bg2)',
          border:'1px solid rgba(255,255,255,0.12)',
          boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
          borderRadius:'20px 20px 0 0',
          maxHeight:'90vh',
        }}
        // On mobile: bottom sheet. On desktop: centered modal (via sm:items-center above)
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold truncate" style={{ color:'#f0f0f8' }}>{title}</h2>
            <p className="text-xs mt-1 truncate" style={{ color:'#606080' }}>{sub}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg transition-all hover:bg-red-500"
            style={{ background:'var(--bg4)', border:'1px solid rgba(255,255,255,0.1)', color:'#a0a0c0' }}>
            ✕
          </button>
        </div>

        {/* Fields */}
        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))' }}>
            {cols.map(c => {
              const val   = row[c]
              const empty = !val || val === ''
              return (
                <div key={c} className="rounded-xl p-3"
                  style={{ background:'var(--bg3)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xs uppercase tracking-widest mb-1.5 truncate" style={{ color:'#606080' }}>{c}</div>
                  <div className="text-sm font-medium break-all leading-snug"
                    style={{ color: empty ? '#606080' : '#a29bfe', fontStyle: empty ? 'italic' : 'normal' }}>
                    {empty ? 'Sem valor' : val}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
