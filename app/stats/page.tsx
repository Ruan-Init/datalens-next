'use client'
import { useStore } from '@/lib/store'
import { isNumericCol, sampleArray, fmt, fmtNumber } from '@/lib/utils'

export default function StatsPage() {
  const { selCols, data, totalRows } = useStore()
  const numCols = selCols.filter(c => isNumericCol(data, c.name))

  const stats = numCols.map(c => {
    const vals = (data[c.name] || []).map(v => parseFloat(v)).filter(v => !isNaN(v))
    if (!vals.length) return null
    const mean   = vals.reduce((a,b) => a+b, 0) / vals.length
    const sample = vals.length > 10000 ? sampleArray(vals, 10000) : vals
    const sorted = [...sample].sort((a,b) => a-b)
    const mid    = Math.floor(sorted.length / 2)
    const med    = sorted.length % 2 === 0 ? (sorted[mid-1]+sorted[mid])/2 : sorted[mid]
    const sd     = Math.sqrt(vals.reduce((a,b) => a+(b-mean)**2, 0) / vals.length)
    const sum    = vals.reduce((a,b) => a+b, 0)
    const min    = vals.reduce((a,b) => a<b?a:b)
    const max    = vals.reduce((a,b) => a>b?a:b)
    return { col:c.name, count:vals.length, nulls:totalRows-vals.length, mean, med, sd, sum, min, max }
  }).filter(Boolean) as any[]

  const globalMax = stats.reduce((a,s) => Math.max(a, s.max), 0)

  return (
    <div className="animate-fade-up space-y-5">
      <h1 className="text-lg sm:text-xl font-bold" style={{ color:'#f0f0f8' }}>📈 Estatísticas Descritivas</h1>

      {numCols.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-4xl mb-3 opacity-30">📊</div>
          <div style={{ color:'#606080' }}>Nenhuma coluna numérica selecionada</div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:'var(--bg3)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    {['Coluna','Contagem','Nulos','Média','Mediana*','Desvio P.','Mínimo','Máximo','Soma','Dist.'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color:'#606080' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.map(s => (
                    <tr key={s.col} className="border-b transition-colors hover:bg-white/5" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                      <td className="py-3 px-4 font-semibold whitespace-nowrap" style={{ color:'#a29bfe' }}>{s.col}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{s.count.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color: s.nulls > 0 ? '#e17055' : '#00b894' }}>{s.nulls.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{fmt(s.mean)}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{fmt(s.med)}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{fmt(s.sd)}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{fmt(s.min)}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{fmt(s.max)}</td>
                      <td className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{fmt(s.sum)}</td>
                      <td className="py-3 px-4" style={{ minWidth:80 }}>
                        <div className="text-xs mb-1" style={{ color:'#606080' }}>{fmtNumber(s.min)}–{fmtNumber(s.max)}</div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background:'var(--bg4)' }}>
                          <div className="h-full rounded-full" style={{ width:`${globalMax > 0 ? s.max/globalMax*100 : 0}%`, background:'#6c5ce7' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs px-4 py-3" style={{ color:'#606080' }}>* Mediana estimada por amostragem (máx. 10k valores)</p>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {stats.map(s => (
              <div key={s.col} className="rounded-2xl p-4" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="font-bold mb-3 pb-2 border-b" style={{ color:'#a29bfe', borderColor:'rgba(255,255,255,0.07)' }}>{s.col}</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l:'Contagem', v:s.count.toLocaleString('pt-BR') },
                    { l:'Nulos',    v:s.nulls.toLocaleString('pt-BR'), c: s.nulls > 0 ? '#e17055' : '#00b894' },
                    { l:'Média',    v:fmt(s.mean) },
                    { l:'Mediana',  v:fmt(s.med) },
                    { l:'Desvio P.',v:fmt(s.sd) },
                    { l:'Soma',     v:fmt(s.sum) },
                    { l:'Mínimo',   v:fmt(s.min) },
                    { l:'Máximo',   v:fmt(s.max) },
                  ].map(row => (
                    <div key={row.l} className="rounded-xl p-3" style={{ background:'var(--bg3)' }}>
                      <div className="text-xs uppercase tracking-widest mb-1" style={{ color:'#606080' }}>{row.l}</div>
                      <div className="font-semibold text-sm" style={{ color: (row as any).c || '#f0f0f8' }}>{row.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
