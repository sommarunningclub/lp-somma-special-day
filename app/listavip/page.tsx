import type { Metadata } from 'next'
import SmoothScroll from '@/components/SmoothScroll'
import ListaVipHero from '@/components/lista-vip/ListaVipHero'
import EventGallerySection from '@/components/special-day/EventGallerySection'

export const metadata: Metadata = {
  title: 'Lista VIP — Somma Special Day',
  description: 'Seja o primeiro a saber a line-up do maior evento do ano do Somma. Garanta sua vaga VIP.',
}

export default function ListaVipPage() {
  return (
    <SmoothScroll>
      <ListaVipHero />
      <EventGallerySection />
    </SmoothScroll>
  )
}
