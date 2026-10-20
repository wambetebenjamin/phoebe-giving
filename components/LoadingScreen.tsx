"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [percent, setPercent] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(media.matches);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setPercent(Math.min(100, Math.round((elapsed / 2400) * 100)));
      if (elapsed >= 1000) setCanSkip(true);
      if (elapsed >= 3000) {
        setPercent(100);
        setVisible(false);
        window.clearInterval(timer);
      }
    }, 80);
    const ready = window.setTimeout(() => setVisible(false), 2600);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(ready);
    };
  }, []);

  if (!visible) return null;

  return (
    <div id="ftco-loader" className="show fullscreen" role="status" aria-live="polite" aria-label="Loading Phoebe Giving">
      {reduce ? null : (
        <svg className="circular" width="48px" height="48px" aria-hidden="true">
          <circle className="path-bg" cx="24" cy="24" r="22" fill="none" strokeWidth="4" stroke="#eeeeee" />
          <circle className="path" cx="24" cy="24" r="22" fill="none" strokeWidth="4" strokeMiterlimit="10" stroke="#F96D00" />
        </svg>
      )}
      <p className="loader-percent">{percent}%</p>
      {canSkip ? (
        <button type="button" className="loader-skip" onClick={() => setVisible(false)}>
          Skip
        </button>
      ) : null}
    </div>
  );
}
