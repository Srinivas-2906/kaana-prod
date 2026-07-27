import type { Metadata } from "next";
import SitePage from "@/components/site/SitePage";
import { homeMetadata } from "@/lib/seo/site";

export const metadata: Metadata = homeMetadata();

export default function Home() {
  return <SitePage />;
}
