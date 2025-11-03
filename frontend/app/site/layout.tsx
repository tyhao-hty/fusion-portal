import type { Metadata } from "next";
import "./styles-legacy.css";
import "../globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { buildSiteMetadata } from "@/components/site/metadata";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_ORIGIN
    ? new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN)
    : undefined,
  ...buildSiteMetadata(),
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
