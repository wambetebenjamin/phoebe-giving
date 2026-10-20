"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";
import { useConsentStore } from "@/lib/consent";

export default function AnalyticsGate() {
  const { consent, hydrate, hydrated } = useConsentStore();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  if (!hydrated || !consent?.analytics) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
