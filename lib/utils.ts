export function formatBytes(b: number): string {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB'
  return (b / 1073741824).toFixed(2) + ' GB'
}

export function fmtNumber(n: number): string {
  if (isNaN(n)) return ''
  const a = Math.abs(n)
  if (a >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (a >= 1000) return (n / 1000).toFixed(1) + 'K'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function fmt(n: number): string {
  if (typeof n !== 'number' || isNaN(n)) return '—'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function isNumericCol(data: Record<string, string[]>, name: string): boolean {
  const vals = (data[name] || []).slice(0, 60).filter(x => x !== '')
  return vals.length > 0 && vals.every(x => !isNaN(parseFloat(x)))
}

export function sampleArray<T>(arr: T[], n: number): T[] {
  const step = Math.floor(arr.length / n)
  return arr.filter((_, i) => i % step === 0).slice(0, n)
}

export interface GroupResult {
  labels: string[]
  values: number[]
  total: number
  processed: number
}

export function groupBy(
  xVals: string[],
  yVals: string[] | null,
  maxG: number,
  mode: 'count' | 'sum' | 'avg' | 'auto'
): GroupResult {
  const groups: Record<string, { sum: number; count: number }> = {}
  const order: string[] = []
  const len = Math.min(1_000_000, xVals.length)

  for (let i = 0; i < len; i++) {
    let k = String(xVals[i]).trim()
    const dm = k.match(/^(\d{4})/)
    if (dm && k.length >= 8) k = dm[1]
    if (k.length > 25) k = k.slice(0, 25)
    const yv = yVals ? parseFloat(yVals[i]) : 1
    const yNum = isNaN(yv) ? 1 : yv
    if (!groups[k]) { groups[k] = { sum: 0, count: 0 }; order.push(k) }
    groups[k].sum += yNum
    groups[k].count++
  }

  const useCount = mode === 'count' || mode === 'auto'
  const sorted = [...order].sort((a, b) => {
    const va = useCount ? groups[a].count : groups[a].sum
    const vb = useCount ? groups[b].count : groups[b].sum
    return vb - va
  })

  const top = sorted.slice(0, maxG)
  return {
    labels: top,
    values: top.map(k => {
      if (mode === 'avg') return groups[k].count ? Math.round(groups[k].sum / groups[k].count * 100) / 100 : 0
      if (mode === 'count' || mode === 'auto') return groups[k].count
      return Math.round(groups[k].sum * 100) / 100
    }),
    total: order.length,
    processed: len,
  }
}

const CHUNK = 4 * 1024 * 1024

export function readFileInChunks(
  file: File,
  onChunk: (lines: string[], offset: number, total: number) => void,
  onDone: () => void,
  onError: () => void
): void {
  let offset = 0
  let first = true
  let leftover = ''

  function next() {
    if (offset >= file.size) { onDone(); return }
    const reader = new FileReader()
    reader.onerror = onError
    reader.onload = (e) => {
      const text = leftover + (e.target?.result as string)
      const lines = text.split('\n')
      leftover = lines.pop() || ''
      if (first) { lines.shift(); first = false }
      onChunk(lines, offset, file.size)
      offset += CHUNK
      setTimeout(next, 0)
    }
    reader.readAsText(file.slice(offset, offset + CHUNK))
  }
  next()
}
