import SmoothScroll from '@/components/SmoothScroll'
import HeroSection from '@/components/special-day/HeroSection'
import LotesSection from '@/components/special-day/LotesSection'
import InscricaoSection from '@/components/special-day/InscricaoSection'
import AttractionsSection from '@/components/special-day/AttractionsSection'
import ScheduleSection from '@/components/special-day/ScheduleSection'
import RouteSection from '@/components/special-day/RouteSection'
import ProofSection from '@/components/special-day/ProofSection'
import EventGallerySection from '@/components/special-day/EventGallerySection'
import MarqueeSection from '@/components/special-day/MarqueeSection'
import FooterSection from '@/components/special-day/FooterSection'
import TFSportsPurchaseJourney from '@/components/special-day/TFSportsPurchaseJourney'
import NutricaoCaptureSection from '@/components/special-day/NutricaoCaptureSection'
import AddToCalendarSection from '@/components/special-day/AddToCalendarSection'
import { getPresaleStatus } from '@/lib/presale'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { closed } = await getPresaleStatus()

  return (
    <SmoothScroll>
      <HeroSection />
      <LotesSection closed={closed} />
      <InscricaoSection closed={closed} />
      <AttractionsSection />
      <ScheduleSection />
      <RouteSection />
      <ProofSection />
      <EventGallerySection />
      <MarqueeSection />
      <TFSportsPurchaseJourney />
      <AddToCalendarSection />
      <NutricaoCaptureSection />
      <FooterSection />
    </SmoothScroll>
  )
}
