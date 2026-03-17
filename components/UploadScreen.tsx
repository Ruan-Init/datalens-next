'use client'
import { useCallback, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { formatBytes } from '@/lib/utils'

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

export default function UploadScreen({ onDone }: { onDone: () => void }) {
  const [drag, setDrag] = useState(false)
  const { setFile, setHeaders } = useStore()

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) { alert('Selecione um arquivo .csv'); return }
    setFile(file)
    const reader = new FileReader()
    reader.onerror = () => alert('Erro ao ler o arquivo.')
    reader.onload = (e) => {
      const first = (e.target?.result as string).split('\n')[0]
      if (!first) { alert('Arquivo vazio.'); return }
      setHeaders(parseCSVLine(first))
      onDone()
    }
    reader.readAsText(file.slice(0, 64 * 1024))
  }, [setFile, setHeaders, onDone])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8" style={{ background:'var(--bg1)' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#6c5ce7,#74b9ff)', boxShadow:'0 0 30px rgba(108,92,231,0.3)' }}>📊</div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ background:'linear-gradient(135deg,#a29bfe,#74b9ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            DataLens Pro
          </div>
          <div className="text-xs mt-1 px-2 py-0.5 rounded-full border inline-block"
            style={{ color:'#a29bfe', borderColor:'rgba(108,92,231,0.3)', background:'rgba(108,92,231,0.1)' }}>
            v3.0 · Professional Edition
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <label htmlFor="file-input"
        className="w-full rounded-3xl text-center cursor-pointer transition-all duration-200 relative overflow-hidden"
        style={{
          maxWidth: 560,
          background: drag ? 'rgba(108,92,231,0.08)' : 'var(--bg2)',
          border: `2px dashed ${drag ? '#6c5ce7' : 'rgba(255,255,255,0.12)'}`,
          transform: drag ? 'translateY(-3px)' : 'none',
          boxShadow: drag ? '0 0 30px rgba(108,92,231,0.2)' : 'none',
          padding: '3rem 2rem',
          display: 'block',
        }}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>

        <input id="file-input" type="file" accept=".csv"
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

        <div className="text-5xl sm:text-6xl mb-4">📂</div>
        <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color:'#f0f0f8' }}>
          Clique aqui para selecionar o arquivo CSV
        </h2>
        <p className="text-sm mb-6" style={{ color:'#a0a0c0', lineHeight:1.7 }}>
          Ou arraste e solte o arquivo nesta área<br />
          <span style={{ color:'#606080', fontSize:12 }}>Processamento 100% local · Dados nunca saem do dispositivo</span>
        </p>
        <div className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm text-white pointer-events-none"
          style={{ background:'linear-gradient(135deg,#6c5ce7,#74b9ff)' }}>
          📂 Selecionar arquivo CSV
        </div>

        <div className="flex gap-4 sm:gap-6 justify-center mt-6 flex-wrap">
          {[
            { dot:'#00b894', label:'Offline total' },
            { dot:'#74b9ff', label:'Até 1M+ linhas' },
            { dot:'#fdcb6e', label:'Gráficos avançados' },
            { dot:'#fd79a8', label:'Busca em tempo real' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs" style={{ color:'#606080' }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:s.dot }} />
              {s.label}
            </div>
          ))}
        </div>
      </label>
    </div>
  )
}
