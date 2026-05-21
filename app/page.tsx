import { redirect } from 'next/navigation'
import { isInsider } from '@/lib/insider'
import SmoothScroll from '@/components/SmoothScroll'
import SairButton from '@/components/acesso/SairButton'
import HeroSection from '@/components/special-day/HeroSection'
import AttractionsSection from '@/components/special-day/AttractionsSection'
import RouteSection from '@/components/special-day/RouteSection'
import ProofSection from '@/components/special-day/ProofSection'
import MarqueeSection from '@/components/special-day/MarqueeSection'
import VipFormSection from '@/components/special-day/VipFormSection'
import FooterSection from '@/components/special-day/FooterSection'
import TFSportsPurchaseJourney from '@/components/special-day/TFSportsPurchaseJourney'

export const dynamic = 'force-dynamic'

export default async function Home() {
  if (!(await isInsider())) {
    redirect('/acesso')
  }

  return (
    <SmoothScroll>
      <SairButton />
      <HeroSection />
      <AttractionsSection />
      <RouteSection />
      <ProofSection />
      <MarqueeSection />
      <TFSportsPurchaseJourney />
      <VipFormSection />
      <FooterSection />
    </SmoothScroll>
  )
}
