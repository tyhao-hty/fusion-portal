import "../globals.css"
import React from "react";
import "../(site)/styles-legacy.cjs";
import { SiteFrame } from "@/components/layouts/SiteFrame";

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
