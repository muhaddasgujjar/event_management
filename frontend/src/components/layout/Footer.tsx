"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, Globe, Camera, Briefcase } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) return null;

  return (
    <footer className="bg-surface border-t border-white/5 pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1 */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6 text-white tracking-tight">
              H&B <span className="text-accent">Event Solution</span>
            </h3>
            <p className="text-muted leading-relaxed mb-6">
              30 years of flawless event production. We deliver premium SMD screens, crystal-clear sound, and custom 3D stalls so you can focus entirely on your guests.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-surface-2 rounded-full text-accent hover:bg-accent hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-surface-2 rounded-full text-accent hover:bg-accent hover:text-white transition-colors">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-surface-2 rounded-full text-accent hover:bg-accent hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider">Services</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/services#smd" className="text-muted hover:text-accent transition-colors">
                  SMD Screen Rentals
                </Link>
              </li>
              <li>
                <Link href="/services#sound" className="text-muted hover:text-accent transition-colors">
                  Professional Sound Systems
                </Link>
              </li>
              <li>
                <Link href="/services#stall" className="text-muted hover:text-accent transition-colors">
                  3D Stall Fabrication
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted hover:text-accent transition-colors">
                  Full Event Setups
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-muted hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted hover:text-accent transition-colors">
                  Our Work
                </Link>
              </li>
              <li>
                <Link href="/quote" className="text-muted hover:text-accent transition-colors">
                  Get a Free Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted hover:text-accent transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>LDA 840, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-muted">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+92 333 4494509</span>
              </li>
              <li className="flex items-center gap-3 text-muted">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>haris.basit143@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-muted">
          <p>© {new Date().getFullYear()} H&B Event Solution. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
