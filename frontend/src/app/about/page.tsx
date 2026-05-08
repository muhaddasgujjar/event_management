import { Metadata } from "next";
import { AboutClient } from "./client";

export const metadata: Metadata = {
  title: "About Us — 30 Years of Excellence | H&B Event Solution",
  description: "Learn about H&B Event Solution's 30-year track record of delivering flawless event production without compromises.",
};

export default function AboutPage() {
  return <AboutClient />;
}
