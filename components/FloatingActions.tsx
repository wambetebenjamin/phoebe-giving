"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SCRIPT =
  "Welcome to Phoebe Giving, the online giving platform for Phoebe Community Church. You can give your tithe, offering, or contribute to any of our active campaigns right here, from any device, at any time. Pay with M-Pesa in seconds and receive an instant receipt. Our finance team tracks every gift transparently so every shilling goes exactly where it was intended.";

const WHATSAPP =
  "https://wa.me/254112272061?text=Hello%20Phoebe%20Giving%2C%20I%20would%20like%20to%20set%20up%20online%20giving%20for%20my%20church.";

export default function FloatingActions() {
  const [speaking, setSpeaking] = useState(false);
  const [ended, setEnded] = useState(false);
  const started = useRef(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function play() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    started.current = true;
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(SCRIPT);
    next.rate = 0.92;
    next.pitch = 1.05;
    next.lang = "en-KE";
    next.onend = () => {
      setSpeaking(false);
      setEnded(true);
    };
    next.onerror = () => setSpeaking(false);
    utterance.current = next;
    setSpeaking(true);
    setEnded(false);
    window.speechSynthesis.speak(next);
  }

  useEffect(() => {
    function begin(event: Event) {
      if (started.current) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.(".voice-btn")) return;
      started.current = true;
      play();
    }
    window.addEventListener("scroll", begin, { once: true, passive: true });
    window.addEventListener("click", begin);
    return () => {
      window.removeEventListener("scroll", begin);
      window.removeEventListener("click", begin);
      window.speechSynthesis?.cancel();
    };
    // play is stable enough for the first interaction listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = speaking ? "Site voice tour, click to mute" : ended ? "Replay tour" : "Site voice tour, click to mute";

  return (
    <>
      <button
        type="button"
        className={`voice-btn ${speaking ? "is-speaking" : ""}`}
        aria-label={label}
        onClick={() => {
          if (speaking) {
            stop();
            setEnded(true);
            return;
          }
          play();
        }}
      >
        {speaking ? <VolumeX size={22} aria-hidden="true" /> : <Volume2 size={22} aria-hidden="true" />}
        <span className="tip">{ended && !speaking ? "Replay tour" : "Hear what this site is about"}</span>
      </button>
      <a className="wa-btn" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp">
        <WhatsAppMark />
        <span className="tip">Chat with us on WhatsApp</span>
      </a>
    </>
  );
}

function WhatsAppMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" fill="#ffffff">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 16.8L1 22.2l5.5-1.1A11 11 0 0 0 20.5 3.5zM12 20.1a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.3.7.7-3.2-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-2-1.2 7.3 7.3 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.1-.3a.5.5 0 0 0 0-.5c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.1-.4-.2z" />
    </svg>
  );
}
