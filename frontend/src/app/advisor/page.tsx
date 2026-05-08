import { Metadata } from "next";
import { AdvisorClient } from "./client";

export const metadata: Metadata = {
  title: "AI Event Advisor — Plan Your Event | H&B Event Solution",
  description: "Talk to our AI Advisor to plan your event, explore services, and build a custom quote — by voice or text.",
};

export default function AdvisorPage() {
  return <AdvisorClient />;
}
