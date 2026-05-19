import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const dm = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Somma Special Day — 18 de Julho 2026 | Lista VIP',
  description:
    'O evento de aniversario de 1 ano do Somma Club. 400 vagas. 8km de percurso inedito, samba, Red Bull e muito mais.',
  openGraph: {
    title: 'Somma Special Day — 18 de Julho 2026 | Lista VIP',
    description:
      'O evento de aniversario de 1 ano do Somma Club. 400 vagas. 8km de percurso inedito, samba, Red Bull e muito mais.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${bebas.variable} ${dm.variable}`}>
      <body className="font-dm bg-somma-black text-somma-white antialiased">
        {children}
      </body>
    </html>
  )
}
