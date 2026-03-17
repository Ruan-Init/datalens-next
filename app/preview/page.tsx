'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import RecordModal from '@/components/RecordModal'

const PAGE_SIZE = 100

export default function PreviewPage() {
  const { selCols, rows } = useStore()
  const [page,     setPage]     = useState(0)
  const [modalRow, setModalRow] = useState<Record<string,string>|null>(null)

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const end   = Math.min(start + PAGE_SIZE, rows.length)
  const slice = rows.slice(start, end)
  const cols  = selCols.map(c => c.name)

  const pageNums = (() => {
    const total = totalPages, cur = page
    if (total <= 7) return Array.from({ length: total }, (_, i) => i)
    if (cur < 4)    return [0,1,2,3,4,-1,total-1]
    if (cur > total-5) return [0,-1,total-5,total-4,total-3,total-2,total-1]
    return [0,-1,cur-1,cur,cur+1,-1,total-1]
  })()

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg sm:text-xl font-bold" style={{ color:'#f0f0f8' }}>👁 Explorar Dados</h1>
        <span className="text-sm" style={{ color:'#606080' }}>
          <span className="font-bold" style={{ color:'#a29bfe' }}>{rows.length.toLocaleString('pt-BR')}</span> registros
        </span>
      </div>

      {/* Table — hidden on small mobile */}
      <div className="hidden sm:block rounded-2xl overflow-hidden" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:'var(--bg3)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {cols.map(h => <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color:'#606080' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {slice.map((row, i) => (
                <tr key={start+i} onClick={() => setModalRow(row)}
                  className="cursor-pointer border-b transition-colors hover:bg-white/5"
                  style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                  {cols.map(h => {
                    const v = String(row[h]||'')
                    return <td key={h} className="py-2.5 px-4 whitespace-nowrap" style={{ color:'#f0f0f8', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis' }} title={v}>{v.slice(0,40)}{v.length>40?'…':''}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards — mobile only */}
      <div className="sm:hidden space-y-2">
        {slice.map((row, i) => (
          <div key={start+i} onClick={() => setModalRow(row)}
            className="rounded-2xl p-4 cursor-pointer transition-all active:scale-95"
            style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
            {cols.slice(0,4).map(h => (
              <div key={h} className="flex justify-between items-start gap-3 mb-1.5">
                <span className="text-xs font-semibold flex-shrink-0" style={{ color:'#606080' }}>{h}</span>
                <span className="text-sm text-right" style={{ color:'#f0f0f8' }}>{String(row[h]||'').slice(0,30)}</span>
              </div>
            ))}
            {cols.length > 4 && <div className="text-xs mt-1" style={{ color:'#6c5ce7' }}>+{cols.length-4} campos — toque para ver todos</div>}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.1)', color:'#a0a0c0' }}>
          ← Anterior
        </button>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          {pageNums.map((p, i) =>
            p === -1 ? (
              <span key={`dots-${i}`} className="text-xs px-1" style={{ color:'#606080' }}>…</span>
            ) : (
              <button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: p===page ? '#6c5ce7' : 'var(--bg2)',
                  border: `1px solid ${p===page ? '#6c5ce7' : 'rgba(255,255,255,0.1)'}`,
                  color: p===page ? '#fff' : '#a0a0c0',
                }}>
                {p+1}
              </button>
            )
          )}
        </div>

        <div className="text-xs text-center" style={{ color:'#606080' }}>
          Pág. {page+1}/{totalPages} · {start+1}–{end} de {rows.length.toLocaleString('pt-BR')}
        </div>

        <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
          style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.1)', color:'#a0a0c0' }}>
          Próxima →
        </button>
      </div>
      <p className="text-xs" style={{ color:'#606080' }}>Clique/toque em qualquer linha para ver a ficha completa</p>

      {modalRow && <RecordModal row={modalRow} selCols={selCols} onClose={() => setModalRow(null)} />}
    </div>
  )
}
