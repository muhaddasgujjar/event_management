import { Metadata } from "next";
import { QuoteClient } from "./client";

export const metadata: Metadata = {
  title: "Get a Free Quote | H&B Event Solution",
  description: "Request a custom quote for your next event. We offer SMD screens, professional sound systems, and custom 3D stall fabrication.",
};

export default function QuotePage() {
  return <QuoteClient />;
}
