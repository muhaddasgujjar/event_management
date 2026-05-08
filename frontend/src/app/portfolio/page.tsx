import { Metadata } from "next";
import { PortfolioClient } from "./client";

export const metadata: Metadata = {
  title: "Portfolio — Our Work | H&B Event Solution",
  description: "View our portfolio of premium event setups including SMD screens, line-array sound systems, and 3D stall fabrication.",
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
