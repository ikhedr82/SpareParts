'use client';

import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { About } from "@/components/landing/about";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { Contact } from "@/components/landing/contact";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <About />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <CTA />
    </div>
  );
}
