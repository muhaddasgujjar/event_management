"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MonitorPlay, Speaker, Hammer, CheckCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const FALLBACK_SERVICES = [
  {
    id: 1, slug: "smd-screen-rental", name: "High-Definition SMD Screen Rentals",
    short_description: "Scalable indoor and outdoor SMD displays with zero dead pixels and seamless playback.",
    full_description: "Deliver your message with uncompromising clarity. We provide scalable, high-brightness SMD screens perfectly calibrated for both indoor ballrooms and outdoor arenas. Certified engineers remain on-site for the entire event duration.",
    features_json: '["Indoor P3 & Outdoor P6 screens","Custom sizes available","Zero dead-pixel guarantee","On-site technician included","Backup equipment on standby"]',
  },
  {
    id: 2, slug: "sound-system-rental", name: "Concert-Grade Sound System Engineering",
    short_description: "Professional line-array systems and wireless microphone setups engineered for your venue acoustics.",
    full_description: "Bad audio ruins great events. We supply and engineer premium line-array sound systems, mixing consoles, and wireless microphone setups tailored to the acoustics of your specific venue.",
    features_json: '["JBL professional line-array systems","Digital mixing consoles","4-channel wireless microphone kits","Acoustic venue assessment included","On-site sound engineer"]',
  },
  {
    id: 3, slug: "3d-stall-fabrication", name: "Custom 3D Stall Fabrication",
    short_description: "From digital 3D render to physical build — premium exhibition stalls that command attention.",
    full_description: "We turn standard floor space into an immersive brand experience. From the initial 3D digital render to the final wood and acrylic fabrication, we handle everything in-house with no middlemen.",
    features_json: '["3D digital render before fabrication","Premium wood, acrylic & metal materials","Custom branding & LED lighting","On-time delivery guaranteed","Full setup and teardown included"]',
  },
];

export function ServicesClient() {
  const [services, setServices] = useState<any[]>(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const loadServices = async () => {
      const { data } = await fetchApi("/api/services/");
      if (data && Array.isArray(data) && data.length > 0) setServices(data);
      setLoading(false);
    };
    loadServices();
  }, []);

  const getIcon = (slug: string) => {
    if (slug.includes("smd")) return <MonitorPlay className="w-6 h-6" />;
    if (slug.includes("sound")) return <Speaker className="w-6 h-6" />;
    if (slug.includes("stall")) return <Hammer className="w-6 h-6" />;
    return <MonitorPlay className="w-6 h-6" />;
  };

  const getImage = (slug: string) => {
    if (slug.includes("smd")) return "/images/smd.png";
    if (slug.includes("sound")) return "/images/sound.png";
    if (slug.includes("stall")) return "/images/stall.png";
    return "/images/hero.png";
  };

  const parseFeatures = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const steps = [
    { num: "01", title: "Inquiry", desc: "Submit your requirements via our Quote Builder." },
    { num: "02", title: "Site Assessment", desc: "Our engineers evaluate the venue constraints." },
    { num: "03", title: "Delivery", desc: "Flawless execution with on-site technical support." },
  ];

  if (loading) return null; // handled by loading.tsx

  return (
    <div className="pt-20">
      <div className="bg-surface border-b border-white/5 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Our Services</h1>
          <p className="text-xl text-muted">
            Specialized event production equipment and fabrication, delivered with zero compromises.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="space-y-32">
          {services.map((service, index) => {
            const features = parseFeatures(service.features_json);
            const isEven = index % 2 === 0;

            return (
              <div key={service.id} id={service.slug} className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center scroll-mt-32`}>
                <motion.div 
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="w-full md:w-1/2"
                >
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/5">
                    <Image
                      src={getImage(service.slug)}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="w-full md:w-1/2 flex flex-col items-start"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                      {getIcon(service.slug)}
                    </div>
                    <Badge status={service.slug.includes("smd") ? "SMD" : service.slug.includes("sound") ? "SOUND" : "STALL"} />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">{service.name}</h2>
                  <p className="text-lg text-accent-light/80 mb-6 font-medium">{service.short_description}</p>
                  <p className="text-muted leading-relaxed mb-8">{service.full_description}</p>
                  
                  {features.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full">
                      {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-muted">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link href={`/quote?service=${service.slug}`}>
                    <Button>Get a Quote for This Service</Button>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="py-24 bg-surface-2 border-t border-white/5 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">How It Works</h2>
            <p className="text-muted">A streamlined process for flawless execution.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-white/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-surface border-2 border-accent/30 text-accent flex items-center justify-center text-3xl font-bold font-heading mb-6 relative">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-muted leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
