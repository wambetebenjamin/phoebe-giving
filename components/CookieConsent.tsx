"use client";

import { useEffect, useState } from "react";
import { useConsentStore, type ConsentState } from "@/lib/consent";

const KEY = "phoebe_giving_consent";

export default function CookieConsent() {
  const { consent, setConsent, hydrated, hydrate } = useConsentStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentState>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated || consent) return null;

  function save(next: ConsentState) {
    const value: ConsentState = { ...next, necessary: true, savedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(value));
    setConsent(value);
    setOpen(false);
  }

  return (
    <>
      <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <p className="mb-2 mb-lg-0">
                Phoebe Giving uses cookies to keep giving sessions secure and, if you allow it, to understand how the site is used.
                Necessary cookies stay on. You can refuse functional, analytics, and marketing cookies. This notice follows the Kenya Data Protection Act 2019.
              </p>
            </div>
            <div className="col-lg-4 text-lg-right">
              <button type="button" className="btn btn-quarternary mr-2 mb-2" onClick={() => save({ necessary: true, functional: true, analytics: true, marketing: true })}>
                Accept All
              </button>
              <button type="button" className="btn btn-tertiary mb-2" onClick={() => setOpen(true)}>
                Manage Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
      {open ? (
        <div className="cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie preferences">
          <div className="cookie-panel">
            <h3 className="mb-3">Cookie preferences</h3>
            <Preference label="Necessary" locked checked note="Required for sign in, security, and remembering this choice." />
            <Preference label="Functional" checked={draft.functional} note="Remembers fund choices and form progress on this device." onChange={(checked) => setDraft({ ...draft, functional: checked })} />
            <Preference label="Analytics" checked={draft.analytics} note="Helps the finance team see which pages are used. No gift amounts are stored in analytics cookies." onChange={(checked) => setDraft({ ...draft, analytics: checked })} />
            <Preference label="Marketing" checked={draft.marketing} note="Used only if the church later shares campaign updates. Off by default." onChange={(checked) => setDraft({ ...draft, marketing: checked })} />
            <div className="mt-3">
              <button type="button" className="btn btn-quarternary mr-2" onClick={() => save(draft)}>Save preferences</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Preference({
  label,
  note,
  checked,
  locked,
  onChange,
}: {
  label: string;
  note: string;
  checked?: boolean;
  locked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="d-flex align-items-start mb-3">
      <input
        type="checkbox"
        className="mr-2 mt-1"
        checked={locked ? true : Boolean(checked)}
        disabled={locked}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span>
        <strong>{label}</strong>
        {locked ? " (locked)" : ""}
        <br />
        <span className="text-muted">{note}</span>
      </span>
    </label>
  );
}
