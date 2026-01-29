import {
  Header,
  HeroSection,
  ProblemSection,
  HowItWorksSection,
  LiveDemoSection,
  WhyAgentAuthSection,
  DeveloperSection,
  CTASection,
  Footer,
} from "@/components";

/**
 * Homepage
 * 
 * Architecture:
 * - One-page flow with clear section breaks
 * - Each section answers ONE question
 * - Shopify Editions structure + Genesis Soil flow
 * - Border-based visual separation (not background color changes)
 * - Vertical rhythm maintained through consistent section padding
 * 
 * Section Order (intentional):
 * 1. Hero - Immediate understanding
 * 2. Problem - Why this exists
 * 3. How It Works - Technical clarity
 * 4. Live Demo - Trust through proof
 * 5. Why AgentAuth - Differentiation
 * 6. Developer - Adoption path
 * 7. CTA - Conversion
 * 8. Footer - Navigation
 */

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <LiveDemoSection />
        <WhyAgentAuthSection />
        <DeveloperSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
