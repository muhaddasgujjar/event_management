import { Metadata } from "next";
import { ContactClient } from "./client";

export const metadata: Metadata = {
  title: "Contact Us | H&B Event Solution",
  description: "Get in touch with H&B Event Solution to discuss your next event in Lahore. Reach us at info@hbeventsolution.com.",
};

export default function ContactPage() {
  return <ContactClient />;
}
