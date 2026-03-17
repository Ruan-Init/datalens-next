'use client'
import { useStore } from '@/lib/store'

export default function ProgressScreen() {
  const { loadProgress, loadTitle, loadInfo } = useStore()
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg1)' }}>
      <div className="w-full max-w-lg rounded-3xl p-12 text-center" style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-6xl mb-6 animate-bounce">⚡</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#f0f0f8' }}>{loadTitle || 'Processando...'}</h2>
        <p className="text-sm mb-8" style={{ color: '#a0a0c0' }}>Aguarde enquanto os dados são carregados</p>
        <div className="rounded-full h-1.5 overflow-hidden mb-3" style={{ background: 'var(--bg4)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${loadProgress}%`, background: 'linear-gradient(90deg, #6c5ce7, #74b9ff)' }} />
        </div>
        <div className="font-bold mb-2" style={{ color: '#a29bfe' }}>{loadProgress}%</div>
        <div className="text-xs" style={{ color: '#606080' }}>{loadInfo}</div>
      </div>
    </div>
  )
}
