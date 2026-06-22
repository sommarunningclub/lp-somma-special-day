import type { Metadata, Viewport } from 'next'
import SmoothScroll from '@/components/SmoothScroll'
import FooterSection from '@/components/special-day/FooterSection'
import EsquentaHero from '@/components/esquenta/EsquentaHero'
import EsquentaCheckin from '@/components/esquenta/EsquentaCheckin'
import EsquentaPosicionamento from '@/components/esquenta/EsquentaPosicionamento'
import EsquentaExperiencias from '@/components/esquenta/EsquentaExperiencias'
import EsquentaConcurso from '@/components/esquenta/EsquentaConcurso'
import EsquentaGaleria from '@/components/esquenta/EsquentaGaleria'
import EsquentaCorreio from '@/components/esquenta/EsquentaCorreio'
import EsquentaProgramacao from '@/components/esquenta/EsquentaProgramacao'
import EsquentaLocalizacao from '@/components/esquenta/EsquentaLocalizacao'
import EsquentaComoChegar from '@/components/esquenta/EsquentaComoChegar'
import EsquentaParceiros from '@/components/esquenta/EsquentaParceiros'
import EsquentaCtaFinal from '@/components/esquenta/EsquentaCtaFinal'
import EsquentaFaq from '@/components/esquenta/EsquentaFaq'
import EsquentaCorreioFloat from '@/components/esquenta/EsquentaCorreioFloat'

const URL = 'https://specialday.sommaclub.com.br/esquenta-junino'
const TITLE = 'Esquenta SOMMA Special Day | Edição Especial Junina em Brasília'
const DESCRIPTION =
  'Corre, café da manhã Big Box, comidas típicas, ativações, sorteios e concurso de melhor caracterização junina. Dia 28 de junho, na 106 Sul, Brasília DF.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Somma Special Day',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Esquenta Somma Special Day · Edição Especial Junina' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

// Experiência app/Apple: trava o zoom e usa as safe-areas (notch/home indicator).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#005EFF',
}

export default function EsquentaJuninoPage() {
  return (
    <SmoothScroll>
      <EsquentaHero />
      <EsquentaCheckin />
      <EsquentaPosicionamento />
      <EsquentaExperiencias />
      <EsquentaConcurso />
      <EsquentaGaleria />
      <EsquentaCorreio />
      <EsquentaProgramacao />
      <EsquentaLocalizacao />
      <EsquentaComoChegar />
      <EsquentaParceiros />
      <EsquentaCtaFinal />
      <EsquentaFaq />
      <FooterSection />
      <EsquentaCorreioFloat />
    </SmoothScroll>
  )
}
