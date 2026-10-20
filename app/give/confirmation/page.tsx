"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import { formatDate, kes } from "@/lib/format";
import { buildReceipt } from "@/lib/pdf";
import type { Gift, Settings } from "@/lib/types";

const FUND: Record<string, string> = {
  tithe: "Tithe",
  offering: "Offering",
  building: "Building Fund",
  missions: "Missions Fund",
  benevolence: "Benevolence Fund",
};

function ConfirmationBody() {
  const params = useSearchParams();
  const ref = params.get("ref") || "";
  const [gift, setGift] = useState<Gift | null>(null);
  const [settings, setSettings] = useState<Partial<Settings> | null>(null);
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!ref) {
      setError("No giving reference was provided.");
      return;
    }
    fetch(`/api/giving/${ref}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Not found");
        setGift(payload.gift);
        setSettings(payload.settings);
        import("qrcode").then((QRCode) => QRCode.toDataURL(payload.gift.ref, { margin: 1, width: 160 }).then(setQr));
      })
      .catch((err: Error) => setError(err.message));
  }, [ref]);

  function download() {
    if (!gift) return;
    const doc = buildReceipt(gift, settings || undefined);
    doc.save(`phoebe-giving-${gift.ref}.pdf`);
  }

  const share = gift
    ? `https://wa.me/254112272061?text=${encodeURIComponent(`Hello Phoebe Giving, my gift reference is ${gift.ref} for ${kes(gift.amount)} to ${FUND[gift.fund] || gift.fund}.`)}`
    : "https://wa.me/254112272061";

  return (
    <>
      <PageBanner title="Gift recorded" crumb="Confirmation" />
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              {error ? <p className="text-danger" role="alert">{error}</p> : null}
              {gift ? (
                <motion.div className="receipt-card" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }}>
                  <p className="subheading">Receipt</p>
                  <h2 className="h3">Thank you, {gift.name}</h2>
                  <p>Your gift is confirmed. Keep this reference for your records.</p>
                  <ul className="list-unstyled">
                    <li><strong>Reference:</strong> {gift.ref}</li>
                    <li><strong>Fund:</strong> {FUND[gift.fund] || gift.fund}</li>
                    <li><strong>Amount:</strong> {kes(gift.amount)}</li>
                    <li><strong>Date:</strong> {formatDate(gift.createdAt)}</li>
                    <li><strong>Payment:</strong> {gift.payment === "mpesa" ? "M-Pesa" : "Card"}</li>
                  </ul>
                  {qr ? <img src={qr} alt={`QR code for reference ${gift.ref}`} width={120} height={120} /> : null}
                  <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                    <button type="button" className="btn btn-quarternary" onClick={download}>Download PDF receipt</button>
                    <a className="btn btn-tertiary" href={share} target="_blank" rel="noreferrer">Share on WhatsApp</a>
                    <Link className="btn btn-outline-secondary" href="/member/dashboard">View history</Link>
                  </div>
                </motion.div>
              ) : !error ? <p>Loading your receipt.</p> : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<p className="p-5">Loading your receipt.</p>}>
      <ConfirmationBody />
    </Suspense>
  );
}
