"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup = () => {};
    let active = true;
    import("lenis").then(({ default: Lenis }) => {
      if (!active) return;
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      let frame = 0;
      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
      cleanup = () => {
        cancelAnimationFrame(frame);
        lenis.destroy();
      };
    });
    return () => {
      active = false;
      cleanup();
    };
  }, []);
  return null;
}
