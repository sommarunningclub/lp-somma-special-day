import type { Metadata } from 'next'
import SmoothScroll from '@/components/SmoothScroll'
import DayUseHero from '@/components/special-day/dayuse/DayUseHero'
import DayUseInclui from '@/components/special-day/dayuse/DayUseInclui'
import DayUsePrograma from '@/components/special-day/dayuse/DayUsePrograma'
import DayUseShow from '@/components/special-day/dayuse/DayUseShow'
import DayUseGincana from '@/components/special-day/dayuse/DayUseGincana'
import DayUseSorteios from '@/components/special-day/dayuse/DayUseSorteios'
import DayUseAlimentacao from '@/components/special-day/dayuse/DayUseAlimentacao'
import DayUseRecovery from '@/components/special-day/dayuse/DayUseRecovery'
import DayUsePrepare from '@/components/special-day/dayuse/DayUsePrepare'
import DayUseParceiros from '@/components/special-day/dayuse/DayUseParceiros'
import DayUseLocalizacao from '@/components/special-day/dayuse/DayUseLocalizacao'
import DayUseCheckout from '@/components/special-day/dayuse/DayUseCheckout'

export const metadata: Metadata = {
  title: 'Day Use · Special Day — Somma Club',
  description: 'Ingresso Day Use do Special Day: acesso a todo o after (samba, DJ, gincana e sorteios) por R$ 75. Não inclui kit nem a corrida.',
}

export default function DayUsePage() {
  return (
    <SmoothScroll>
      <DayUseHero />
      <DayUseInclui />
      <DayUsePrograma />
      <DayUseShow />
      <DayUseGincana />
      <DayUseSorteios />
      <DayUseAlimentacao />
      <DayUseRecovery />
      <DayUsePrepare />
      <DayUseParceiros />
      <DayUseLocalizacao />
      <DayUseCheckout />
    </SmoothScroll>
  )
}
