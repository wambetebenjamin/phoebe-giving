import type { Metadata } from "next";
import type { ReactNode } from "react";
import AnalyticsGate from "@/components/AnalyticsGate";
import CookieConsent from "@/components/CookieConsent";
import FloatingActions from "@/components/FloatingActions";
import LoadingScreen from "@/components/LoadingScreen";
import Providers from "@/components/Providers";
import SiteShell from "@/components/SiteShell";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Phoebe Giving",
    template: "%s | Phoebe Giving",
  },
  description: "Every gift tracked. Every purpose served. Church giving and tithe management for Phoebe Community Church.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:200,300,400,500,600,700,800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/css/animate.css" />
        <link rel="stylesheet" href="/css/owl.carousel.min.css" />
        <link rel="stylesheet" href="/css/owl.theme.default.min.css" />
        <link rel="stylesheet" href="/css/magnific-popup.css" />
        <link rel="stylesheet" href="/css/bootstrap-datepicker.css" />
        <link rel="stylesheet" href="/css/jquery.timepicker.css" />
        <link rel="stylesheet" href="/css/flaticon.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/phoebe-overrides.css" />
      </head>
      <body>
        <Providers>
          <SmoothScroll />
          <LoadingScreen />
          <SiteShell>{children}</SiteShell>
          <CookieConsent />
          <FloatingActions />
          <AnalyticsGate />
        </Providers>
      </body>
    </html>
  );
}
