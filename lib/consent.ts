"use client";

import { create } from "zustand";

export type ConsentState = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  savedAt?: string;
};

type ConsentStore = {
  consent: ConsentState | null;
  hydrated: boolean;
  hydrate: () => void;
  setConsent: (value: ConsentState) => void;
};

export const useConsentStore = create<ConsentStore>((set) => ({
  consent: null,
  hydrated: false,
  hydrate: () => {
    try {
      const raw = localStorage.getItem("phoebe_giving_consent");
      set({ consent: raw ? (JSON.parse(raw) as ConsentState) : null, hydrated: true });
    } catch {
      set({ consent: null, hydrated: true });
    }
  },
  setConsent: (value) => set({ consent: value, hydrated: true }),
}));
