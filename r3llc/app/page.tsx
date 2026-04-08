import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import ProblemSection from '@/components/sections/ProblemSection'
import ServicesOverview from '@/components/sections/ServicesOverview'
import HowItWorks from '@/components/sections/HowItWorks'
import IndustriesSection from '@/components/sections/IndustriesSection'
import FounderSection from '@/components/sections/FounderSection'
import CaseStudiesPreview from '@/components/sections/CaseStudiesPreview'
import ConsultationCTA from '@/components/sections/ConsultationCTA'

export const metadata: Metadata = {
  title: 'R3 LLC — Business Systems & Execution',
  description:
    'R3 LLC is an AI-enabled business systems firm. We help companies eliminate operational drag, accelerate contract workflows, and build execution infrastructure that scales.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <ServicesOverview />
      <HowItWorks />
      <IndustriesSection />
      <FounderSection />
      <CaseStudiesPreview />
      <ConsultationCTA />
    </>
  )
}
