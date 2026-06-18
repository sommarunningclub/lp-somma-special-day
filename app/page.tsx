import SmoothScroll from '@/components/SmoothScroll'
import HeroSection from '@/components/special-day/HeroSection'
import AttractionsSection from '@/components/special-day/AttractionsSection'
import ScheduleSection from '@/components/special-day/ScheduleSection'
import RouteSection from '@/components/special-day/RouteSection'
import ProofSection from '@/components/special-day/ProofSection'
import EventGallerySection from '@/components/special-day/EventGallerySection'
import MarqueeSection from '@/components/special-day/MarqueeSection'
import FooterSection from '@/components/special-day/FooterSection'
import TFSportsPurchaseJourney from '@/components/special-day/TFSportsPurchaseJourney'

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <SmoothScroll>
      <HeroSection />
      <AttractionsSection />
      <ScheduleSection />
      <RouteSection />
      <ProofSection />
      <EventGallerySection />
      <MarqueeSection />
      <TFSportsPurchaseJourney />
      <FooterSection />
    </SmoothScroll>
  )
}
