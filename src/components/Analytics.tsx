"use client";

import Script from "next/script";

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const scriptUrl =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://umami.is/script.js";

export default function Analytics() {
  if (!websiteId) return null;

  return (
    <Script
      async
      defer
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
