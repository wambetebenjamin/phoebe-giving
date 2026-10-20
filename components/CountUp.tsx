"use client";

import { useEffect, useRef } from "react";

export default function CountUp({ value, prefix = "" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    import("gsap").then(({ default: gsap }) => {
      if (cancelled || !node) return;
      const state = { val: 0 };
      gsap.to(state, {
        val: value,
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => {
          node.textContent = prefix + Math.round(state.val).toLocaleString("en-KE");
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [prefix, value]);

  return <span ref={ref}>{prefix}0</span>;
}
