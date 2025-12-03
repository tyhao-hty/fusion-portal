import type { Metadata } from "next";

const SITE_TITLE = "核聚变门户";
const SITE_DESCRIPTION = "核聚变门户 — 汇聚发展历程、理论知识、技术路线与商业动向，带你全面了解聚变能源。";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
};

export function buildSiteMetadata({ title, description, path }: BuildMetadataOptions = {}): Metadata {
  const pageTitle = title ? `${title} - ${SITE_TITLE}` : SITE_TITLE;
  const canonicalPath = path ?? "/";

  return {
    title: pageTitle,
    description: description ?? SITE_DESCRIPTION,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: pageTitle,
      description: description ?? SITE_DESCRIPTION,
      url: canonicalPath,
      type: "website",
      siteName: SITE_TITLE,
      images: [
        {
          url: "/assets/og-default.png",
          width: 1200,
          height: 630,
          alt: SITE_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description ?? SITE_DESCRIPTION,
      images: ["/assets/og-default.png"],
    },
  };
}
