import { Footer } from '@/components/landing/footer';
import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingNavbar } from '@/components/landing/navbar';
import { Pricing } from '@/components/landing/pricing';
import { SocialProof } from '@/components/landing/social-proof';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-hero-gradient">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <Footer />
    </main>
  );
}