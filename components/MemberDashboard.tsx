"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/CountUp";
import PageBanner from "@/components/PageBanner";
import { formatDate, kes } from "@/lib/format";
import { buildReceipt, buildStatement } from "@/lib/pdf";
import type { Gift } from "@/lib/types";

type Payload = {
  gifts: Gift[];
  summary: { yearTotal: number; monthTotal: number; byFund: { fund: string; total: number }[] };
  recurring: Gift[];
  user: { name?: string | null; email: string };
  settings: { churchName: string };
};

export default function MemberDashboard() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [adjust, setAdjust] = useState<Record<string, string>>({});

  async function load() {
    const response = await fetch("/api/giving/history");
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Could not load giving history.");
      return;
    }
    setData(payload);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(recurringId: string, action: string, amount?: number) {
    await fetch("/api/giving/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurringId, action, amount }),
    });
    load();
  }

  function statement() {
    if (!data) return;
    const year = new Date().getUTCFullYear();
    const gifts = data.gifts.filter((gift) => new Date(gift.createdAt).getUTCFullYear() === year);
    buildStatement(data.user.name || "Member", year, gifts, data.settings).save(`phoebe-giving-statement-${year}.pdf`);
  }

  return (
    <>
      <PageBanner title="My giving" crumb="Member" />
      <section className="ftco-section">
        <div className="container">
          {error ? <p className="text-danger" role="alert">{error}</p> : null}
          {data ? (
            <>
              <div className="row mb-4">
                <div className="col-md-4 mb-3"><div className="kpi-card"><p className="text-muted mb-1">This year</p><h3><CountUp value={data.summary.yearTotal} prefix="KES " /></h3></div></div>
                <div className="col-md-4 mb-3"><div className="kpi-card"><p className="text-muted mb-1">This month</p><h3><CountUp value={data.summary.monthTotal} prefix="KES " /></h3></div></div>
                <div className="col-md-4 mb-3">
                  <div className="kpi-card">
                    <p className="text-muted mb-1">By fund this year</p>
                    {data.summary.byFund.map((item) => (
                      <div key={item.fund} className="d-flex justify-content-between"><span>{item.fund}</span><strong>{kes(item.total)}</strong></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4 mb-0">Giving history</h2>
                  <button type="button" className="btn btn-tertiary" onClick={statement}>Download annual statement</button>
                </div>
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead><tr><th>Date</th><th>Fund</th><th>Amount</th><th>Reference</th><th>Receipt</th></tr></thead>
                    <tbody>
                      {data.gifts.map((gift) => (
                        <tr key={gift.ref}>
                          <td>{formatDate(gift.createdAt)}</td>
                          <td>{gift.fund}</td>
                          <td>{kes(gift.amount)}</td>
                          <td>{gift.ref}</td>
                          <td><button type="button" className="btn btn-link p-0" onClick={() => buildReceipt(gift, data.settings).save(`${gift.ref}.pdf`)}>Download</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="panel">
                <h2 className="h4">Recurring giving</h2>
                {data.recurring.length === 0 ? <p>No active recurring gifts.</p> : null}
                {data.recurring.map((gift) => (
                  <div key={gift.recurringId} className="border-bottom py-3">
                    <strong>{gift.fund}</strong> · {kes(gift.amount)} · {gift.frequency} · {gift.recurringStatus}
                    <div className="mt-2 d-flex flex-wrap" style={{ gap: 8 }}>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => act(gift.recurringId!, gift.recurringStatus === "paused" ? "resume" : "pause")}>
                        {gift.recurringStatus === "paused" ? "Resume" : "Pause"}
                      </button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => act(gift.recurringId!, "cancel")}>Cancel</button>
                      <input className="form-control" style={{ maxWidth: 140 }} placeholder="New amount" value={adjust[gift.recurringId!] || ""} onChange={(event) => setAdjust({ ...adjust, [gift.recurringId!]: event.target.value })} />
                      <button type="button" className="btn btn-quarternary btn-sm" onClick={() => act(gift.recurringId!, "adjust", Number(adjust[gift.recurringId!]))}>Adjust</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : !error ? <p>Loading your giving.</p> : null}
        </div>
      </section>
    </>
  );
}
