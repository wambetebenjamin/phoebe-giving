"use client";

import { useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import { formatDate, kes } from "@/lib/format";
import type { Gift } from "@/lib/types";

type Row = {
  name: string;
  email: string;
  phone: string;
  total: number;
  lastGift: string;
  recurring: string;
};

export default function GiversDirectory() {
  const [q, setQ] = useState("");
  const [fund, setFund] = useState("all");
  const [frequency, setFrequency] = useState("all");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [history, setHistory] = useState<Gift[] | null>(null);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ q, fund, frequency, min, max });
    fetch(`/api/admin/givers?${params}`).then(async (response) => {
      const payload = await response.json();
      if (response.ok) setRows(payload.rows);
    });
  }, [q, fund, frequency, min, max]);

  async function open(email: string) {
    setSelected(email);
    const response = await fetch(`/api/admin/givers?email=${encodeURIComponent(email)}`);
    const payload = await response.json();
    setHistory(payload.giver?.gifts || []);
  }

  return (
    <>
      <PageBanner title="Giver directory" crumb="Givers" />
      <section className="ftco-section">
        <div className="container">
          <div className="panel">
            <div className="row">
              <div className="col-md-3 mb-2"><input className="form-control" placeholder="Search name or email" value={q} onChange={(event) => setQ(event.target.value)} /></div>
              <div className="col-md-2 mb-2">
                <select className="form-control" value={fund} onChange={(event) => setFund(event.target.value)}>
                  <option value="all">All funds</option>
                  <option value="tithe">Tithe</option>
                  <option value="offering">Offering</option>
                  <option value="building">Building</option>
                  <option value="missions">Missions</option>
                  <option value="benevolence">Benevolence</option>
                </select>
              </div>
              <div className="col-md-2 mb-2">
                <select className="form-control" value={frequency} onChange={(event) => setFrequency(event.target.value)}>
                  <option value="all">All frequencies</option>
                  <option value="one-time">One time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="col-md-2 mb-2"><input className="form-control" placeholder="Min KES" value={min} onChange={(event) => setMin(event.target.value)} /></div>
              <div className="col-md-2 mb-2"><input className="form-control" placeholder="Max KES" value={max} onChange={(event) => setMax(event.target.value)} /></div>
            </div>
            <div className="table-responsive mt-3">
              <table className="table admin-table">
                <thead><tr><th>Name</th><th>Total given</th><th>Last gift</th><th>Recurring</th></tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.email || row.phone} onClick={() => open(row.email || row.phone)} style={{ cursor: "pointer" }}>
                      <td>{row.name}</td>
                      <td>{kes(row.total)}</td>
                      <td>{formatDate(row.lastGift)}</td>
                      <td>{row.recurring}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {history ? (
            <div className="panel">
              <h2 className="h4">History for {selected}</h2>
              <table className="table admin-table">
                <thead><tr><th>Date</th><th>Fund</th><th>Amount</th><th>Reference</th></tr></thead>
                <tbody>
                  {history.map((gift) => (
                    <tr key={gift.ref}>
                      <td>{formatDate(gift.createdAt)}</td>
                      <td>{gift.fund}</td>
                      <td>{kes(gift.amount)}</td>
                      <td>{gift.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
