import { Metadata } from "next";
import { ServicesClient } from "./client";

export const metadata: Metadata = {
  title: "Services — SMD Screens, Sound Systems, 3D Stalls | H&B Event Solution",
  description: "Explore our premium event production services including SMD screen rentals, professional sound systems, and custom 3D stall fabrication.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
