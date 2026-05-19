import type { Metadata } from 'next'
import SmoothScroll from '@/components/SmoothScroll'
import ListaVipHero from '@/components/lista-vip/ListaVipHero'

export const metadata: Metadata = {
  title: 'Lista VIP — Somma Special Day',
  description: 'Seja o primeiro a saber a line-up do maior evento do ano do Somma. Garanta sua vaga VIP.',
}

export default function ListaVipPage() {
  return (
    <SmoothScroll>
      <ListaVipHero />
    </SmoothScroll>
  )
}
