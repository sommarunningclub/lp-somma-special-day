import SmoothScroll from '@/components/SmoothScroll'
import HeroSection from '@/components/special-day/HeroSection'
import AttractionsSection from '@/components/special-day/AttractionsSection'
import ProofSection from '@/components/special-day/ProofSection'
import MarqueeSection from '@/components/special-day/MarqueeSection'
import VipFormSection from '@/components/special-day/VipFormSection'
import FooterSection from '@/components/special-day/FooterSection'

export default function Home() {
  return (
    <SmoothScroll>
      <HeroSection />
      <AttractionsSection />
      <ProofSection />
      <MarqueeSection />
      <VipFormSection />
      <FooterSection />
    </SmoothScroll>
  )
}
