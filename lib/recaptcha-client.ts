"use client";

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render: (el: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void }) => number;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load reCAPTCHA"));
    document.head.appendChild(script);
  });
}

export async function executeRecaptcha(action: string): Promise<{ token: string; version: "v3" | "v2" }> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return { token: "demo", version: "v3" };
  await loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`);
  await new Promise<void>((resolve) => window.grecaptcha?.ready(resolve));
  const token = await window.grecaptcha!.execute(siteKey, { action });
  return { token, version: "v3" };
}

export async function renderRecaptchaV2(element: HTMLElement): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return "demo-v2";
  await loadScript("https://www.google.com/recaptcha/api.js?render=explicit");
  await new Promise<void>((resolve) => window.grecaptcha?.ready(resolve));
  return new Promise((resolve, reject) => {
    window.grecaptcha!.render(element, {
      sitekey: siteKey,
      callback: (token) => resolve(token),
      "error-callback": () => reject(new Error("reCAPTCHA failed")),
    });
  });
}
