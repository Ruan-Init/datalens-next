'use client'
import { useState, useEffect } from 'react'
import { useStore, ColInfo } from '@/lib/store'
import { formatBytes, isNumericCol, readFileInChunks } from '@/lib/utils'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') inQ = !inQ
    else if (c === ',' && !inQ) { result.push(cur.trim()); cur = '' }
    else cur += c
  }
  result.push(cur.trim())
  return result
}

export default function PickerScreen({
  onBack, onDone
}: { onBack: () => void; onDone: () => void }) {
  const { file, headers, setSelCols, setData, setRows, setTotalRows, setProgress, setLoading } = useStore()
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(i) ? s.delete(i) : s.add(i)
      return s
    })
  }

  const selectAll = () => setSelected(new Set(headers.map((_, i) => i)))
  const clearAll = () => setSelected(new Set())

  const startAnalysis = () => {
    if (!file || selected.size === 0) return
    const cols: ColInfo[] = [...selected].map(i => ({ name: headers[i], idx: i }))
    setSelCols(cols)

    const data: Record<string, string[]> = {}
    const rows: Record<string, string>[] = []
    let total = 0
    cols.forEach(c => { data[c.name] = [] })

    setLoading(true)
    setProgress(0, 'Processando arquivo...', '')

    readFileInChunks(
      file,
      (lines, offset, fileSize) => {
        const pct = Math.min(99, Math.round(offset / fileSize * 100))
        setProgress(pct, 'Processando...', `${total.toLocaleString('pt-BR')} registros · ${(offset / 1048576).toFixed(1)}MB / ${(fileSize / 1048576).toFixed(1)}MB`)
        for (const line of lines) {
          if (!line.trim()) continue
          const cells = parseCSVLine(line)
          if (!cells.length) continue
          total++
          const row: Record<string, string> = {}
          cols.forEach(c => { row[c.name] = cells[c.idx] ?? '' })
          rows.push(row)
          cols.forEach(c => {
            const v = cells[c.idx]
            if (v !== undefined && v !== '') data[c.name].push(v)
          })
        }
        setTotalRows(total)
      },
      () => {
        setProgress(100, 'Concluído!', `${total.toLocaleString('pt-BR')} registros carregados`)
        setData(data)
        setRows(rows)
        setTotalRows(total)
        setTimeout(() => { setLoading(false); onDone() }, 600)
      },
      () => { alert('Erro ao processar o arquivo.'); setLoading(false) }
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg1)' }}>
      <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 p-5 border-b" style={{ background: 'var(--bg2)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: '#f0f0f8' }}>Configurar colunas de análise</h2>
              <p className="text-sm mt-1" style={{ color: '#a0a0c0' }}>
                {file && formatBytes(file.size)} · {headers.length} colunas detectadas
              </p>
            </div>
            <button onClick={onBack} className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#a0a0c0' }}>
              ↩ Trocar arquivo
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={selectAll}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6c5ce7, #74b9ff)' }}>
              ✓ Selecionar todas
            </button>
            <button onClick={clearAll}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#a0a0c0', background: 'transparent' }}>
              ✕ Limpar
            </button>
            <span className="text-sm" style={{ color: '#606080' }}>
              Selecionadas: <span className="font-bold" style={{ color: '#a29bfe' }}>{selected.size}</span>
            </span>
          </div>
          <div className="mt-3 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)', color: '#a29bfe' }}>
            💡 Selecione todas as colunas para acesso completo aos dados de cada registro
          </div>
        </div>

        {/* Grid */}
        <div className="grid p-5 gap-2 max-h-96 overflow-y-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))' }}>
          {headers.map((h, i) => (
            <div key={i} onClick={() => toggle(i)}
              className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: selected.has(i) ? 'rgba(108,92,231,0.12)' : 'var(--bg4)',
                border: `1px solid ${selected.has(i) ? '#6c5ce7' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-xs text-white transition-all"
                style={{
                  background: selected.has(i) ? '#6c5ce7' : 'transparent',
                  border: `1.5px solid ${selected.has(i) ? '#6c5ce7' : 'rgba(255,255,255,0.2)'}`,
                }}>
                {selected.has(i) && '✓'}
              </div>
              <span className="text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#f0f0f8' }}
                title={h}>{h}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'var(--bg3)' }}>
          <button
            disabled={selected.size === 0}
            onClick={startAnalysis}
            className="w-full py-4 rounded-xl font-extrabold text-base text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6c5ce7, #74b9ff)' }}>
            {selected.size === 0 ? 'Selecione ao menos uma coluna' : `▶  Analisar ${selected.size} coluna${selected.size > 1 ? 's' : ''} — Iniciar`}
          </button>
        </div>
      </div>
    </div>
  )
}
