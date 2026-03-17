'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import UploadScreen from './UploadScreen'
import PickerScreen from './PickerScreen'
import ProgressScreen from './ProgressScreen'
import DashboardPage from '@/app/dashboard/page'
import ChartsPage from '@/app/charts/page'
import StatsPage from '@/app/stats/page'
import SearchPage from '@/app/search/page'
import PreviewPage from '@/app/preview/page'

type Screen  = 'upload' | 'picker' | 'progress' | 'app'
type AppPage = 'dashboard' | 'charts' | 'stats' | 'search' | 'preview'

interface NavItemDef {
  page: AppPage
  icon: string
  label: string
}

const navItems: NavItemDef[] = [
  { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { page: 'charts',    icon: '📊', label: 'Gráficos' },
  { page: 'stats',     icon: '📈', label: 'Estatísticas' },
  { page: 'search',    icon: '🔍', label: 'Busca' },
  { page: 'preview',   icon: '👁',  label: 'Explorar' },
]

export default function AppShell() {
  const [screen, setScreen]       = useState<Screen>('upload')
  const [page, setPage]           = useState<AppPage>('dashboard')
  const [sidebarOpen, setSidebar] = useState(false)
  const { file, isLoading, reset } = useStore()

  const goPage  = (p: AppPage) => { setPage(p); setSidebar(false) }
  const doReset = () => { reset(); setScreen('upload'); setPage('dashboard') }

  if (screen === 'upload')               return <UploadScreen  onDone={() => setScreen('picker')} />
  if (screen === 'picker' && !isLoading) return <PickerScreen  onBack={() => setScreen('upload')} onDone={() => setScreen('app')} />
  if (screen === 'picker' && isLoading)  return <ProgressScreen />
  if (screen === 'progress')             return <ProgressScreen />

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--bg1)' }}>

      {/* ── TOPBAR ── */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 border-b flex-shrink-0"
        style={{ background: 'var(--bg2)', borderColor: 'rgba(255,255,255,0.07)', height: 56 }}>

        <button onClick={() => setSidebar(o => !o)} aria-label="Menu"
          className="flex-shrink-0 flex flex-col justify-center gap-1 w-8 h-8 rounded-lg lg:hidden"
          style={{ display: 'flex' }}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block h-0.5 rounded transition-all duration-200"
              style={{
                width: 20, background: sidebarOpen ? '#a29bfe' : '#a0a0c0',
                transform: sidebarOpen
                  ? (i === 0 ? 'rotate(45deg) translate(4px,4px)' : i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'scaleX(0)')
                  : '',
                opacity: (i === 1 && sidebarOpen) ? 0 : 1,
              }} />
          ))}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6c5ce7,#74b9ff)' }}>📊</div>
          <div className="min-w-0">
            <div className="text-sm font-extrabold"
              style={{ background: 'linear-gradient(135deg,#a29bfe,#74b9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DataLens Pro
            </div>
            <div className="text-xs truncate hidden sm:block" style={{ color: '#606080', maxWidth: '18rem' }}>{file?.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setScreen('picker')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', background: 'transparent', whiteSpace: 'nowrap' }}>
            <span className="hidden sm:inline">← Colunas</span>
            <span className="sm:hidden">←</span>
          </button>
          <button onClick={doReset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', background: 'transparent', whiteSpace: 'nowrap' }}>
            <span className="hidden sm:inline">↩ Novo arquivo</span>
            <span className="sm:hidden">↩</span>
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 relative">

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', top: 56 }}
            onClick={() => setSidebar(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <nav className="flex flex-col py-4 border-r flex-shrink-0"
          id="sidebar"
          style={{
            background: 'var(--bg2)',
            borderColor: 'rgba(255,255,255,0.07)',
            width: 200,
            position: 'fixed' as const,
            top: 56,
            bottom: 0,
            left: 0,
            zIndex: 40,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
            overflowY: 'auto',
          }}>
          <NavSection label="Visão Geral" items={navItems.slice(0, 1)} active={page} onClick={goPage} />
          <NavSection label="Análise"     items={navItems.slice(1, 3)} active={page} onClick={goPage} mt />
          <NavSection label="Dados"       items={navItems.slice(3)}    active={page} onClick={goPage} mt />
        </nav>

        <div className="hidden lg:block flex-shrink-0" style={{ width: 200 }} />

        {/* ── MAIN ── */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg1)', minWidth: 0 }}>
          <div className="p-4 sm:p-5 lg:p-6 pb-24 lg:pb-6">
            {page === 'dashboard' && <DashboardPage />}
            {page === 'charts'    && <ChartsPage />}
            {page === 'stats'     && <StatsPage />}
            {page === 'search'    && <SearchPage />}
            {page === 'preview'   && <PreviewPage />}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t lg:hidden"
        style={{ background: 'var(--bg2)', borderColor: 'rgba(255,255,255,0.1)' }}>
        {navItems.map(item => (
          <button key={item.page} onClick={() => goPage(item.page)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all"
            style={{
              color: page === item.page ? '#a29bfe' : '#606080',
              background: page === item.page ? 'rgba(108,92,231,0.1)' : 'transparent',
              borderTop: page === item.page ? '2px solid #6c5ce7' : '2px solid transparent',
            }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.03em' }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          #sidebar {
            position: sticky !important;
            top: 56px !important;
            height: calc(100vh - 56px) !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}

interface NavSectionProps {
  label: string
  items: NavItemDef[]
  active: AppPage
  onClick: (p: AppPage) => void
  mt?: boolean
}

function NavSection({ label, items, active, onClick, mt }: NavSectionProps) {
  return (
    <>
      <div style={{
        fontSize: 10, color: '#606080', textTransform: 'uppercase' as const,
        letterSpacing: '0.1em', fontWeight: 700,
        padding: `${mt ? '20px' : '0'} 16px 4px`,
      }}>
        {label}
      </div>
      {items.map(item => (
        <button key={item.page} onClick={() => onClick(item.page)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', width: '100%', textAlign: 'left' as const,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            color: active === item.page ? '#a29bfe' : '#a0a0c0',
            background: active === item.page ? 'rgba(108,92,231,0.1)' : 'transparent',
            borderRight: active === item.page ? '3px solid #6c5ce7' : '3px solid transparent',
            transition: 'all 0.15s',
            border: 'none',
          }}>
          <span style={{ fontSize: 16, width: 20, textAlign: 'center' as const, flexShrink: 0 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </>
  )
}
