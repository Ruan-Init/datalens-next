'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { isNumericCol, groupBy, fmtNumber, fmt } from '@/lib/utils'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts'

const COLORS = [
  '#6c5ce7','#74b9ff','#00cec9','#fdcb6e','#e17055',
  '#a29bfe','#fd79a8','#00b894','#55efc4','#fab1a0',
  '#0984e3','#e84393','#6ab04c','#f9ca24','#30336b',
]

const tooltipStyle = {
  background: '#1a1a28',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#f0f0f8',
  fontSize: 13,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}
const axisStyle = { fill: '#606080', fontSize: 11 }

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold mb-1" style={{ color: '#a29bfe', fontSize: 12 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: '#f0f0f8' }}>{fmtNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const ScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div style={{ color: '#f0f0f8', fontSize: 12 }}>
        X: <span style={{ color: '#74b9ff' }}>{fmtNumber(d?.x)}</span>
        &nbsp;·&nbsp;Y: <span style={{ color: '#a29bfe' }}>{fmtNumber(d?.y)}</span>
      </div>
    </div>
  )
}

export default function ChartsPage() {
  const { selCols, data } = useStore()
  const [type, setType] = useState('bar')
  const [colX, setColX] = useState(selCols[0]?.name || '')
  const [colY, setColY] = useState(
    selCols.find(c => isNumericCol(data, c.name))?.name || selCols[0]?.name || ''
  )
  const [agg, setAgg] = useState<'auto' | 'count' | 'sum' | 'avg'>('auto')
  const [maxG, setMaxG] = useState(20)
  const [chartData, setChartData] = useState<any[] | null>(null)
  const [chartMeta, setChartMeta] = useState('')
  const [colXLabel, setColXLabel] = useState('')
  const [colYLabel, setColYLabel] = useState('')

  const numCols = selCols.filter(c => isNumericCol(data, c.name))

  const generate = () => {
    if (!colX || !colY) return
    setColXLabel(colX)
    setColYLabel(colY)

    if (type === 'scatter') {
      const xV = data[colX] || [], yV = data[colY] || []
      const len = Math.min(2000, xV.length, yV.length)
      const pts = Array.from({ length: len }, (_, i) => ({
        x: parseFloat(xV[i]) || 0,
        y: parseFloat(yV[i]) || 0
      }))
      setChartData(pts)
      setChartMeta(`${colX} × ${colY} · ${len.toLocaleString('pt-BR')} pontos`)
      return
    }

    const grp = groupBy(
      data[colX] || [],
      agg !== 'count' ? (data[colY] || []) : null,
      maxG,
      agg
    )
    const d = grp.labels.map((l, i) => ({ name: l, value: grp.values[i] }))
    setChartData(d)
    const aggLabel =
      agg === 'count' || agg === 'auto' ? 'contagem'
      : agg === 'avg' ? `média de ${colY}`
      : `soma de ${colY}`
    setChartMeta(
      `${colX} — ${aggLabel} · ${grp.labels.length} de ${grp.total} categorias · ${grp.processed.toLocaleString('pt-BR')} registros analisados`
    )
  }

  const selStyle = { background: 'var(--bg4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8' }

  return (
    <div className="animate-fade-up">
      <h1 className="text-xl font-bold flex items-center gap-2 mb-5" style={{ color: '#f0f0f8' }}>
        📊 Gráficos Avançados
      </h1>

      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-end pb-5 mb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {[
            {
              label: 'Tipo de gráfico', el:
              <select value={type} onChange={e => setType(e.target.value)} className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={selStyle}>
                <option value="bar">📊 Barras verticais</option>
                <option value="bar-h">📊 Barras horizontais</option>
                <option value="line">📈 Linha</option>
                <option value="pie">🥧 Pizza</option>
                <option value="doughnut">🍩 Rosca</option>
                <option value="scatter">✦ Dispersão</option>
              </select>
            },
            {
              label: 'Eixo X / Categoria', el:
              <select value={colX} onChange={e => setColX(e.target.value)} className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={selStyle}>
                {selCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            },
            {
              label: 'Eixo Y / Valor', el:
              <select value={colY} onChange={e => setColY(e.target.value)} className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={selStyle}>
                {(numCols.length ? numCols : selCols).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            },
            {
              label: 'Agregação', el:
              <select value={agg} onChange={e => setAgg(e.target.value as any)} className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={selStyle}>
                <option value="auto">Automático</option>
                <option value="count">Contagem</option>
                <option value="sum">Soma</option>
                <option value="avg">Média</option>
              </select>
            },
            {
              label: 'Máx. categorias', el:
              <select value={maxG} onChange={e => setMaxG(Number(e.target.value))} className="rounded-lg px-3 py-2 text-sm outline-none w-full" style={selStyle}>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={30}>Top 30</option>
                <option value={50}>Top 50</option>
                <option value={999999}>Todos</option>
              </select>
            },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1 flex-1 min-w-32">
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#606080' }}>{f.label}</span>
              {f.el}
            </div>
          ))}
          <button onClick={generate}
            className="px-6 py-2 rounded-xl font-bold text-sm text-white self-end transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6c5ce7, #74b9ff)', minWidth: 140 }}>
            ▶ Gerar gráfico
          </button>
        </div>

        {/* Chart */}
        <div style={{ minHeight: 420 }} className="flex items-center justify-center">
          {!chartData ? (
            <div className="text-center" style={{ color: '#606080' }}>
              <div className="text-5xl mb-3 opacity-50">📊</div>
              <div className="text-sm">Configure as opções e clique em <strong style={{ color: '#a0a0c0' }}>▶ Gerar gráfico</strong></div>
            </div>
          ) : (
            <div className="w-full">
              <p className="text-xs mb-4 text-center" style={{ color: '#606080' }}>{chartMeta}</p>
              <ResponsiveContainer width="100%" height={380}>
                {type === 'scatter' ? (
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="x" type="number" name={colXLabel}
                      tick={axisStyle} axisLine={false} tickLine={false}
                      tickFormatter={fmtNumber}
                      label={{ value: colXLabel, position: 'bottom', fill: '#606080', fontSize: 11 }} />
                    <YAxis dataKey="y" type="number" name={colYLabel}
                      tick={axisStyle} axisLine={false} tickLine={false}
                      tickFormatter={fmtNumber}
                      label={{ value: colYLabel, angle: -90, position: 'insideLeft', fill: '#606080', fontSize: 11 }} />
                    <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
                    <Scatter data={chartData} fill="#6c5ce7" fillOpacity={0.7} />
                  </ScatterChart>

                ) : type === 'pie' || type === 'doughnut' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="45%"
                      cy="50%"
                      outerRadius={type === 'doughnut' ? 140 : 155}
                      innerRadius={type === 'doughnut' ? 70 : 0}
                      dataKey="value"
                      label={({ name, percent, value }) =>
                        percent > 0.04 ? `${(percent * 100).toFixed(1)}%` : ''
                      }
                      labelLine={false}
                      paddingAngle={2}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, color: '#a0a0c0', paddingLeft: 16 }}
                      formatter={(value) => String(value).slice(0, 20)}
                    />
                  </PieChart>

                ) : type === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 50, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name"
                      tick={{ ...axisStyle, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      angle={-35} textAnchor="end"
                      interval="preserveStartEnd"
                      label={{ value: colXLabel, position: 'bottom', offset: 35, fill: '#606080', fontSize: 11 }} />
                    <YAxis
                      tick={axisStyle} axisLine={false} tickLine={false}
                      tickFormatter={fmtNumber}
                      label={{ value: colYLabel, angle: -90, position: 'insideLeft', fill: '#606080', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey="value"
                      stroke="#6c5ce7" strokeWidth={2.5}
                      dot={chartData.length <= 50 ? { fill: '#6c5ce7', r: 4, strokeWidth: 0 } : false}
                      activeDot={{ r: 6, fill: '#a29bfe', strokeWidth: 0 }}
                    />
                  </LineChart>

                ) : type === 'bar-h' ? (
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 60, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmtNumber} />
                    <YAxis
                      type="category" dataKey="name"
                      tick={{ ...axisStyle, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      width={110}
                      tickFormatter={(v) => String(v).slice(0, 14)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="right" style={{ fill: '#a0a0c0', fontSize: 10 }} formatter={fmtNumber} />
                    </Bar>
                  </BarChart>

                ) : (
                  // bar (vertical)
                  <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 55, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ ...axisStyle, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      angle={chartData.length > 8 ? -35 : 0}
                      textAnchor={chartData.length > 8 ? 'end' : 'middle'}
                      interval={0}
                      tickFormatter={(v) => String(v).slice(0, 14)}
                      label={{ value: colXLabel, position: 'bottom', offset: 42, fill: '#606080', fontSize: 11 }}
                    />
                    <YAxis
                      tick={axisStyle} axisLine={false} tickLine={false}
                      tickFormatter={fmtNumber}
                      label={{ value: colYLabel, angle: -90, position: 'insideLeft', fill: '#606080', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                      {chartData.length <= 15 && (
                        <LabelList dataKey="value" position="top" style={{ fill: '#a0a0c0', fontSize: 10 }} formatter={fmtNumber} />
                      )}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
