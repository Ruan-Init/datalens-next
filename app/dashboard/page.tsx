'use client'
import { useStore } from '@/lib/store'
import { formatBytes, isNumericCol, groupBy, fmtNumber } from '@/lib/utils'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts'

const COLORS = ['#6c5ce7','#74b9ff','#00cec9','#fdcb6e','#e17055','#a29bfe','#fd79a8','#00b894']
const TT = { background:'#1a1a28', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f0f0f8', fontSize:12 }

export default function DashboardPage() {
  const { file, selCols, data, totalRows } = useStore()
  const numCols = selCols.filter(c => isNumericCol(data, c.name))
  const catCols = selCols.filter(c => !isNumericCol(data, c.name))
  const totalVals = selCols.reduce((a, c) => a + (data[c.name]?.length || 0), 0)
  const missing = totalRows * selCols.length - totalVals
  const completeness = totalRows && selCols.length
    ? ((totalVals / (totalRows * selCols.length)) * 100).toFixed(1) : '100'

  const kpis = [
    { icon:'📋', label:'Total de Registros', value: totalRows.toLocaleString('pt-BR'), sub: file ? formatBytes(file.size) : '', color:'#6c5ce7' },
    { icon:'📂', label:'Colunas Analisadas',  value: selCols.length, sub:`${numCols.length} numéricas · ${catCols.length} texto`, color:'#74b9ff' },
    { icon:'✅', label:'Completude',           value:`${completeness}%`, sub:`${missing.toLocaleString('pt-BR')} ausentes`, color:'#00b894' },
    { icon:'🔢', label:'Numéricas',            value: numCols.length, sub:'Para gráficos e stats', color:'#fdcb6e' },
    { icon:'🔤', label:'Texto',                value: catCols.length, sub:'Para agrupamento', color:'#e17055' },
    { icon:'💾', label:'Tamanho do Arquivo',   value: file ? formatBytes(file.size) : '—', sub:`${selCols.length} colunas carregadas`, color:'#fd79a8' },
  ]

  const catChart = catCols[0] ? groupBy(data[catCols[0].name] || [], null, 8, 'count') : null
  const pieData  = catChart ? catChart.labels.map((l, i) => ({ name: l, value: catChart.values[i] })) : []

  const histData = (() => {
    if (!numCols[0]) return null
    const vals = (data[numCols[0].name] || []).map(v => parseFloat(v)).filter(v => !isNaN(v))
    if (!vals.length) return null
    const min = vals.reduce((a,b) => a<b?a:b)
    const max = vals.reduce((a,b) => a>b?a:b)
    const sz  = (max - min) / 10 || 1
    const cnt = Array(10).fill(0)
    vals.forEach(v => { const b = Math.min(Math.floor((v-min)/sz), 9); cnt[b]++ })
    return cnt.map((c, i) => ({ name: fmtNumber(min + i * sz), value: c }))
  })()

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg sm:text-xl font-bold" style={{ color:'#f0f0f8' }}>🏠 Dashboard</h1>
        <span className="text-xs" style={{ color:'#606080' }}>{new Date().toLocaleString('pt-BR')}</span>
      </div>

      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))' }}>
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5"
            style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:k.color }} />
            <div className="text-xl mb-2">{k.icon}</div>
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color:'#606080' }}>{k.label}</div>
            <div className="text-2xl font-extrabold tracking-tight" style={{ color:'#f0f0f8' }}>{k.value}</div>
            <div className="text-xs mt-1" style={{ color:'#606080' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick charts */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-2xl p-4" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#a0a0c0' }}>
            📊 {catCols[0] ? `Distribuição: ${catCols[0].name}` : 'Distribuição por Categoria'}
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="40%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ percent }) => percent > 0.05 ? `${(percent*100).toFixed(0)}%` : ''}
                  labelLine={false} paddingAngle={2}>
                  {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={TT} />
                <Legend layout="vertical" align="right" verticalAlign="middle"
                  iconType="circle" iconSize={7}
                  wrapperStyle={{ fontSize:10, color:'#a0a0c0' }}
                  formatter={(v:string) => v.slice(0,16)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-4xl opacity-20">📊</div>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#a0a0c0' }}>
            📈 {numCols[0] ? `Histograma: ${numCols[0].name}` : 'Distribuição Numérica'}
          </div>
          {histData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={histData} margin={{ top:5, right:10, bottom:5, left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill:'#606080', fontSize:9 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill:'#606080', fontSize:9 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="value" radius={[4,4,0,0]} maxBarSize={40}>
                  {histData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-4xl opacity-20">📈</div>
          )}
        </div>
      </div>

      {/* Column summary */}
      <div className="rounded-2xl p-4" style={{ background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:'#a0a0c0' }}>🗂 Resumo das Colunas</div>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm" style={{ minWidth:500 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {['Coluna','Tipo','Preenchidos','Nulos','Únicos*','Exemplos'].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color:'#606080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selCols.map(c => {
                const vals  = data[c.name] || []
                const isNum = isNumericCol(data, c.name)
                const uniq  = new Set(vals.slice(0,5000)).size
                const nulls = totalRows - vals.length
                return (
                  <tr key={c.name} className="border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                    <td className="py-2.5 pr-4 font-semibold whitespace-nowrap" style={{ color:'#a29bfe' }}>{c.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:'rgba(108,92,231,0.15)', color:'#a29bfe' }}>
                        {isNum ? 'Numérico' : 'Texto'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{vals.length.toLocaleString('pt-BR')}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap" style={{ color: nulls > 0 ? '#e17055' : '#00b894' }}>
                      {nulls.toLocaleString('pt-BR')} {nulls > 0 ? '▲' : '✓'}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap" style={{ color:'#f0f0f8' }}>{uniq.toLocaleString('pt-BR')}</td>
                    <td className="py-2.5 flex flex-wrap gap-1">
                      {vals.slice(0,3).map((v,i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background:'var(--bg4)', color:'#a0a0c0' }}>
                          {String(v).slice(0,12)}
                        </span>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-3" style={{ color:'#606080' }}>* Únicos estimados com amostra de até 5.000 valores</p>
      </div>
    </div>
  )
}
