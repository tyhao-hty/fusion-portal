import type { Metadata } from "next";
import "./styles-legacy.css";
import { SiteFrame } from "@/components/layouts/SiteFrame";
import { buildSiteMetadata } from "@/components/site/metadata";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_ORIGIN
    ? new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN)
    : undefined,
  ...buildSiteMetadata(),
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
