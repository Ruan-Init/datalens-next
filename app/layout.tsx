import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DataLens Pro — Análise de Dados CSV',
  description: 'Ferramenta profissional de análise de dados CSV. 100% offline. Next.js 16.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
