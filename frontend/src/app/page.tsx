import { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { WhyHB } from "@/components/home/WhyHB";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "H&B Event Solution — Premium Event Production in Lahore",
  description: "30 years of flawless event production. SMD screens, sound systems, and 3D stall fabrication for pharma, corporate, and concert events.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ServicesPreview />
      <WhyHB />
      <PortfolioPreview />
      <TestimonialsCarousel />
      <FAQAccordion />
      <NewsletterBand />
      <FinalCTA />
    </>
  );
}
