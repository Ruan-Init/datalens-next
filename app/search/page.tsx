'use client'
import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/lib/store'
import RecordModal from '@/components/RecordModal'

interface SearchResult { row: Record<string,string>; idx: number }

export default function SearchPage() {
  const { selCols, data, rows } = useStore()
  const [searchCol,  setSearchCol]  = useState('__ALL__')
  const [searchTerm, setSearchTerm] = useState('')
  const [results,    setResults]    = useState<SearchResult[]>([])
  const [searched,   setSearched]   = useState(false)
  const [modalRow,   setModalRow]   = useState<Record<string,string>|null>(null)
  const [geoUfCol,   setGeoUfCol]   = useState('')
  const [geoUfVal,   setGeoUfVal]   = useState('')
  const [geoCityCol, setGeoCityCol] = useState('')
  const [geoCityVal, setGeoCityVal] = useState('')

  useEffect(() => {
    const uf   = selCols.find(c => /^UF_|^UF$|_UF$|^UF_PART$|^ESTADO$/i.test(c.name))
    const city = selCols.find(c => /^MUNIC|^CIDADE|^CITY/i.test(c.name))
    if (uf)   setGeoUfCol(uf.name)
    if (city) setGeoCityCol(city.name)
  }, [selCols])

  const ufOptions = useMemo(() => {
    if (!geoUfCol) return []
    return [...new Set(data[geoUfCol] || [])].sort().slice(0, 100)
  }, [geoUfCol, data])

  const examples = useMemo(() => {
    const sexo  = selCols.find(c => /SEXO/i.test(c.name))
    const morte = selCols.find(c => /MORTE/i.test(c.name))
    const raca  = selCols.find(c => /RACA/i.test(c.name))
    const diag  = selCols.find(c => /DIAG/i.test(c.name))
    const uti   = selCols.find(c => /MARCA_UTI|^UTI/i.test(c.name))
    return [
      sexo  && { icon:'♀',  title:'Sexo feminino',   desc:'Sexo = 3',       col:sexo.name,  val:'3' },
      morte && { icon:'💀', title:'Com óbito',        desc:'MORTE = 1',      col:morte.name, val:'1' },
      raca  && { icon:'👤', title:'Raça parda',       desc:'RACA_COR = 03',  col:raca.name,  val:'03' },
      diag  && { icon:'🫁', title:'Pneumonia J18',    desc:'DIAG = J18',     col:diag.name,  val:'J18' },
      uti   && { icon:'🏥', title:'Usou UTI',         desc:'MARCA_UTI = 1',  col:uti.name,   val:'1' },
      { icon:'🔎', title:'Busca livre', desc:'Todas as colunas', col:'__ALL__', val:'urgencia' },
    ].filter(Boolean) as { icon:string; title:string; desc:string; col:string; val:string }[]
  }, [selCols])

  const runSearch = (col: string, term: string) => {
    const t = term.trim().toLowerCase()
    if (!col || !t) return
    const res: SearchResult[] = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const hit = col === '__ALL__'
        ? selCols.some(sc => String(row[sc.name]||'').toLowerCase().includes(t))
        : String(row[col]||'').toLowerCase().includes(t)
      if (hit) res.push({ row, idx: i })
      if (res.length >= 500) break
    }
    setResults(res)
    setSearched(true)
  }

  const doSearch   = () => { if (!searchCol) { alert('Selecione a coluna.'); return } runSearch(searchCol, searchTerm) }
  const quickSearch = (col:string, val:string) => { setSearchCol(col); setSearchTerm(val); runSearch(col, val) }
  const doGeoSearch = () => {
    const ufV = geoUfVal.toLowerCase(), ctV = geoCityVal.trim().toLowerCase()
    if (!ufV && !ctV) { alert('Selecione estado ou cidade.'); return }
    const res: SearchResult[] = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const ufOk = !ufV || !geoUfCol   || String(row[geoUfCol]||'').toLowerCase() === ufV
      const ctOk = !ctV || !geoCityCol  || String(row[geoCityCol]||'').toLowerCase().includes(ctV)
      if (ufOk && ctOk) res.push({ row, idx: i })
      if (res.length >= 500) break
    }
    setResults(res)
    setSearched(true)
  }

  const showCols = selCols.slice(0, 6).map(c => c.name)
  const SS = { background:'var(--bg4)', border:'1px solid rgba(255,255,255,0.1)', color:'#f0f0f8', borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none', width:'100%' }

  return (
    <div className="animate-fade-up space-y-4">
      <h1 className="text-lg sm:text-xl font-bold" style={{ color:'#f0f0f8' }}>🔍 Busca Avançada</h1>

      {/* Examples */}
      <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))' }}>
        {examples.map(ex => (
          <div key={ex.col+ex.val} onClick={() => quickSearch(ex.col, ex.val)}
            className="rounded-2xl p-3 cursor-pointer flex items-start gap-3 transition-all hover:-translate-y-0.5"
            style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize:22, flexShrink:0 }}>{ex.icon}</span>
            <div>
              <div className="text-sm font-semibold mb-0.5" style={{ color:'#f0f0f8' }}>{ex.title}</div>
              <div className="text-xs" style={{ color:'#606080' }}>{ex.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Geo filter */}
      <div className="rounded-2xl p-4" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#a0a0c0' }}>🗺️ Filtro Geográfico</div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-3">
          <div>
            <div className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color:'#606080' }}>Coluna de UF</div>
            <select value={geoUfCol} onChange={e => setGeoUfCol(e.target.value)} style={SS}>
              <option value="">— coluna —</option>
              {selCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color:'#606080' }}>Estado / UF</div>
            <select value={geoUfVal} onChange={e => setGeoUfVal(e.target.value)} disabled={!geoUfCol}
              style={{ ...SS, opacity: geoUfCol ? 1 : 0.4 }}>
              <option value="">— Todos —</option>
              {ufOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color:'#606080' }}>Coluna de Cidade</div>
            <select value={geoCityCol} onChange={e => setGeoCityCol(e.target.value)} style={SS}>
              <option value="">— coluna —</option>
              {selCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color:'#606080' }}>Cidade</div>
            <input value={geoCityVal} onChange={e => setGeoCityVal(e.target.value)}
              onKeyDown={e => e.key==='Enter' && doGeoSearch()}
              placeholder="Ex: São Paulo..." disabled={!geoCityCol}
              style={{ ...SS, opacity: geoCityCol ? 1 : 0.4 }} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={doGeoSearch} className="px-4 py-2 rounded-xl font-bold text-sm text-white" style={{ background:'#6c5ce7' }}>🗺️ Filtrar</button>
          <button onClick={() => { setGeoUfVal(''); setGeoCityVal(''); setResults([]); setSearched(false) }}
            className="px-4 py-2 rounded-xl text-sm" style={{ border:'1px solid rgba(255,255,255,0.12)', color:'#a0a0c0', background:'transparent' }}>✕ Limpar</button>
        </div>
      </div>

      {/* Search bar */}
      <div className="rounded-2xl p-4" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#a0a0c0' }}>🔍 Buscar por Campo</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col gap-1 sm:w-52">
            <div className="text-xs uppercase tracking-widest font-semibold" style={{ color:'#606080' }}>Coluna</div>
            <select value={searchCol} onChange={e => setSearchCol(e.target.value)} style={SS}>
              <option value="">— Selecione —</option>
              <option value="__ALL__">🔎 Todas as colunas</option>
              {selCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-xs uppercase tracking-widest font-semibold" style={{ color:'#606080' }}>Termo</div>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key==='Enter' && doSearch()}
              placeholder="Digite o valor a buscar..." style={SS} />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={doSearch} className="px-5 py-2 rounded-xl font-bold text-sm text-white flex-shrink-0" style={{ background:'#6c5ce7' }}>Buscar</button>
            <button onClick={() => { setSearchTerm(''); setResults([]); setSearched(false) }}
              className="px-3 py-2 rounded-xl text-sm flex-shrink-0" style={{ border:'1px solid rgba(255,255,255,0.12)', color:'#a0a0c0', background:'transparent' }}>✕</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="rounded-2xl overflow-hidden" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
          {results.length === 0 ? (
            <div className="text-center py-12" style={{ color:'#606080' }}>
              <div className="text-4xl mb-3 opacity-30">🔍</div>
              Nenhum resultado encontrado.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 flex items-center gap-2 border-b text-sm font-semibold" style={{ borderColor:'rgba(255,255,255,0.07)', color:'#a29bfe' }}>
                <div className="w-2 h-2 rounded-full" style={{ background:'#00b894' }} />
                {results.length.toLocaleString('pt-BR')} resultado(s){results.length >= 500 ? ' (máx. 500)' : ''}
              </div>

              {/* Table — hidden on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:'var(--bg3)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      {showCols.map(h => <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color:'#606080' }}>{h}</th>)}
                      <th className="py-3 px-4" style={{ background:'var(--bg3)' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(({ row, idx }) => (
                      <tr key={idx} onClick={() => setModalRow(row)} className="cursor-pointer border-b transition-colors hover:bg-white/5" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                        {showCols.map(h => {
                          const v = String(row[h]||''), t = searchTerm.toLowerCase(), i = v.toLowerCase().indexOf(t)
                          return (
                            <td key={h} className="py-3 px-4 whitespace-nowrap" style={{ color:'#f0f0f8', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis' }}>
                              {i !== -1 && t ? <>{v.slice(0,i)}<mark style={{ background:'rgba(108,92,231,0.35)', color:'#a29bfe', borderRadius:3, padding:'0 2px' }}>{v.slice(i,i+t.length)}</mark>{v.slice(i+t.length)}</> : v.slice(0,35)+(v.length>35?'…':'')}
                            </td>
                          )
                        })}
                        <td className="py-3 px-4">
                          <button className="text-xs px-3 py-1 rounded-lg font-semibold whitespace-nowrap" style={{ background:'rgba(108,92,231,0.15)', color:'#a29bfe', border:'1px solid rgba(108,92,231,0.3)' }}>Ver ficha</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards — mobile only */}
              <div className="sm:hidden divide-y" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
                {results.map(({ row, idx }) => (
                  <div key={idx} onClick={() => setModalRow(row)} className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                    {showCols.slice(0,3).map(h => (
                      <div key={h} className="flex justify-between items-center gap-3 mb-1">
                        <span className="text-xs" style={{ color:'#606080', flexShrink:0 }}>{h}</span>
                        <span className="text-sm font-medium text-right" style={{ color:'#f0f0f8' }}>{String(row[h]||'').slice(0,30)}</span>
                      </div>
                    ))}
                    <div className="mt-2">
                      <button className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background:'rgba(108,92,231,0.15)', color:'#a29bfe', border:'1px solid rgba(108,92,231,0.3)' }}>Ver ficha completa →</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs px-4 py-3" style={{ color:'#606080' }}>Clique para ver ficha completa do registro</p>
            </>
          )}
        </div>
      )}

      {modalRow && <RecordModal row={modalRow} selCols={selCols} onClose={() => setModalRow(null)} />}
    </div>
  )
}
