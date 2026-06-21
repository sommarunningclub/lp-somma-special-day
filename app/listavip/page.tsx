import type { Metadata } from 'next'
import SmoothScroll from '@/components/SmoothScroll'
import ListaVipHero from '@/components/lista-vip/ListaVipHero'
import ListaVipClosed from '@/components/lista-vip/ListaVipClosed'
import EventGallerySection from '@/components/special-day/EventGallerySection'
import { getPresaleStatus } from '@/lib/presale'

export const dynamic = 'force-dynamic'

const LINEUP_RELEASE = new Date('2026-06-22T00:00:00-03:00').getTime()

export const metadata: Metadata = {
  title: 'Lista VIP — Somma Special Day',
  description: 'Seja o primeiro a saber a line-up do maior evento do ano do Somma. Garanta sua vaga VIP.',
}

export default async function ListaVipPage() {
  if (Date.now() >= LINEUP_RELEASE) {
    return <ListaVipClosed />
  }

  const { closed } = await getPresaleStatus()

  return (
    <SmoothScroll>
      <ListaVipHero closed={closed} />
      <EventGallerySection />
    </SmoothScroll>
  )
}
