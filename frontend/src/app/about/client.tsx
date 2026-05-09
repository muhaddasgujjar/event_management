"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  Briefcase,
  Star,
  Crosshair,
  ShieldCheck,
  Diamond,
  PackageOpen,
  Wrench,
  Clock,
  ChevronRight,
  Building2,
  Mic2,
  Monitor,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" } }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function AboutClient() {
  const stats = [
    { value: "30+", label: "Years Experience", icon: <Award className="w-5 h-5" /> },
    { value: "500+", label: "Events Delivered", icon: <Star className="w-5 h-5" /> },
    { value: "200+", label: "Corporate Clients", icon: <Users className="w-5 h-5" /> },
    { value: "100%", label: "On-Time Rate", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const expertise = [
    { label: "3D Stall Design & Fabrication", pct: 95, icon: <Layers className="w-4 h-4" /> },
    { label: "SMD Screen & LED Solutions", pct: 92, icon: <Monitor className="w-4 h-4" /> },
    { label: "Professional Sound Systems", pct: 90, icon: <Mic2 className="w-4 h-4" /> },
    { label: "Corporate Event Management", pct: 88, icon: <Building2 className="w-4 h-4" /> },
    { label: "Client & Project Management", pct: 93, icon: <Briefcase className="w-4 h-4" /> },
  ];

  const values = [
    { title: "Precision", desc: "Every pixel mapped perfectly, every decibel calibrated.", icon: <Crosshair className="w-8 h-8" /> },
    { title: "Reliability", desc: "Zero tolerance for equipment failure. On-time, every time.", icon: <ShieldCheck className="w-8 h-8" /> },
    { title: "Excellence", desc: "Delivering an uncompromising standard of quality.", icon: <Diamond className="w-8 h-8" /> },
  ];

  const differentiators = [
    { title: "We Own All Equipment", desc: "No sub-renting delays or markups.", icon: <PackageOpen className="w-6 h-6" /> },
    { title: "No Middlemen", desc: "Direct communication with the technical teams.", icon: <Wrench className="w-6 h-6" /> },
    { title: "On-Site Engineers", desc: "Expert support stays until the event ends.", icon: <Clock className="w-6 h-6" /> },
  ];

  return (
    <div className="pt-20 overflow-x-hidden">

      {/* ─── PERSONAL HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center py-24 bg-primary overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-surface/60 blur-[80px]" />
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212,168,67,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,.6) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Text */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              animate="show"
              className="order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Founder & CEO — H&B Event Solution
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-white leading-tight mb-4">
                Abdul{" "}
                <span className="text-accent relative">
                  Basit
                  <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-accent to-transparent rounded-full" />
                </span>
              </h1>

              <p className="text-lg text-muted leading-relaxed mb-8 max-w-xl">
                Over three decades of transforming blank venues into unforgettable experiences. I lead H&B Event Solution with a hands-on approach — from 3D stall conception to the final sound check — ensuring every event we touch exceeds expectation.
              </p>

              {/* Contact chips */}
              <div className="flex flex-wrap gap-3 mb-10">
                {[
                  { icon: <MapPin className="w-4 h-4" />, label: "Lahore, Pakistan" },
                  { icon: <Mail className="w-4 h-4" />, label: "info@hbeventsolution.com" },
                  { icon: <Phone className="w-4 h-4" />, label: "+92-300-0000000" },
                ].map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 bg-surface-2 border border-white/5 text-accent-light text-sm px-4 py-2 rounded-full"
                  >
                    <span className="text-accent">{c.icon}</span>
                    {c.label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="/documents/Abdul_Basit_Resume.pdf"
                  download="Abdul_Basit_CV.pdf"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </a>
                <Link href="/contact">
                  <Button variant="ghost" size="lg" className="border border-white/10 hover:border-accent/40 px-7 py-3.5">
                    Get in Touch
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right — Photo */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate="show"
              className="order-1 lg:order-2 flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-accent/30 via-transparent to-accent/10 blur-2xl" />
                {/* Gold ring */}
                <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-br from-accent via-accent/60 to-transparent p-[2px]">
                  <div className="w-full h-full rounded-[2.4rem] bg-primary" />
                </div>
                {/* Photo */}
                <div className="relative w-72 h-80 md:w-80 md:h-[26rem] lg:w-96 lg:h-[30rem] rounded-[2.2rem] overflow-hidden border border-accent/20 shadow-2xl">
                  <Image
                    src="/images/haris-basit.jpg"
                    alt="Abdul Basit — Founder & CEO"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold font-heading text-lg">Abdul Basit</p>
                    <p className="text-accent text-sm font-medium">Founder & CEO</p>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-5 -left-5 bg-surface-2 border border-accent/20 rounded-2xl px-5 py-3.5 shadow-xl"
                >
                  <p className="text-3xl font-bold text-accent font-heading">30+</p>
                  <p className="text-xs text-muted font-medium">Years in Event Production</p>
                </motion.div>

                {/* Floating badge 2 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65 }}
                  className="absolute -top-4 -right-4 bg-accent text-primary rounded-2xl px-4 py-3 shadow-xl"
                >
                  <p className="text-2xl font-bold font-heading">500+</p>
                  <p className="text-xs font-bold">Events Delivered</p>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="bg-surface border-y border-white/5 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
                  {s.icon}
                </div>
                <p className="text-4xl font-bold font-heading text-white">{s.value}</p>
                <p className="text-sm text-muted mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERTISE / SKILL BARS ─── */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-3">Capabilities</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">
                What I Bring to Every Event
              </h3>
              <p className="text-muted leading-relaxed mb-8">
                From concept to teardown, I oversee every technical discipline in-house. No guesswork, no outsourcing — just direct expertise applied to your event.
              </p>
              <a
                href="/documents/Abdul_Basit_Resume.pdf"
                download="Abdul_Basit_CV.pdf"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                View full credentials in my CV
              </a>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {expertise.map((skill, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-accent-light text-sm font-medium">
                      <span className="text-accent">{skill.icon}</span>
                      {skill.label}
                    </div>
                    <span className="text-accent font-bold text-sm">{skill.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── CV DOWNLOAD BANNER ─── */}
      <section className="py-16 bg-surface-2 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 rounded-2xl p-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center shrink-0">
                <Download className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-white mb-1">
                  Want to Know More?
                </h3>
                <p className="text-muted text-sm">
                  My full CV includes detailed project history, technical certifications, and client references.
                </p>
              </div>
            </div>
            <a
              href="/documents/Abdul_Basit_Resume.pdf"
              download="Abdul_Basit_CV.pdf"
              className="shrink-0 inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download CV (PDF)
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── COMPANY ORIGIN STORY ─── */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Our Origin Story</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">
                Founded on a Promise of Perfection
              </h3>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  H&B Event Solution was founded 30 years ago in Lahore with a simple but unyielding philosophy: event production should be flawless. In an industry plagued by sub-contractors, faulty rentals, and missed deadlines, we decided to do things differently.
                </p>
                <p>
                  We invested heavily in owning our own inventory of high-end SMD screens, professional line-array sound systems, and a dedicated 3D stall fabrication workshop. By eliminating middlemen, we guarantee the quality of every component that reaches your venue.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="bg-surface-2 border border-white/5 p-8 rounded-2xl relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
              <h4 className="text-2xl font-bold font-heading text-white mb-4 relative z-10">Mission Statement</h4>
              <p className="text-xl text-accent-light/90 italic leading-relaxed relative z-10">
                "To empower organizations to deliver unforgettable experiences by providing rock-solid technical infrastructure and unparalleled on-site engineering."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CORE VALUES ─── */}
      <section className="py-24 bg-surface border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center text-white mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((val, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-primary border border-white/5 p-8 rounded-2xl text-center flex flex-col items-center hover:border-accent/20 transition-colors duration-300"
              >
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                <p className="text-muted">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIFFERENTIATORS ─── */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {differentiators.map((diff, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 text-accent">{diff.icon}</div>
                <h4 className="text-lg font-bold text-white mb-2">{diff.title}</h4>
                <p className="text-sm text-muted">{diff.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 30 YEARS STRIP ─── */}
      <section className="bg-accent text-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
            30 Years of Excellence. Thousands of Events. Zero Compromises.
          </h2>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-heading text-white mb-6">Experience the Difference</h2>
            <p className="text-xl text-muted mb-10">Stop worrying about the technical details. Leave it to the veterans.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button size="lg" className="px-10 py-5 w-full sm:w-auto">Start Your Quote Now</Button>
              </Link>
              <a
                href="/documents/Abdul_Basit_Resume.pdf"
                download="Abdul_Basit_CV.pdf"
                className="inline-flex items-center justify-center gap-2 border border-accent/30 text-accent hover:bg-accent/10 font-semibold px-10 py-5 rounded-xl transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Download My CV
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
