"use client";

import { useState } from "react";
import PageBanner from "@/components/PageBanner";
import { formatDate, kes } from "@/lib/format";
import type { Gift } from "@/lib/types";

export default function ReportsAdmin() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-10-20");
  const [fund, setFund] = useState("all");
  const [giver, setGiver] = useState("");
  const [rows, setRows] = useState<Gift[]>([]);
  const [total, setTotal] = useState(0);

  async function run() {
    const params = new URLSearchParams({ from, to, fund, giver });
    const response = await fetch(`/api/admin/reports?${params}`);
    const payload = await response.json();
    if (response.ok) {
      setRows(payload.gifts);
      setTotal(payload.total);
    }
  }

  function download(format: "pdf" | "csv") {
    const params = new URLSearchParams({ from, to, fund, giver, format });
    window.location.href = `/api/admin/reports?${params}`;
  }

  return (
    <>
      <PageBanner title="Reports" crumb="Reports" />
      <section className="ftco-section">
        <div className="container">
          <div className="panel">
            <div className="row">
              <div className="col-md-3 mb-2"><label>From</label><input type="date" className="form-control" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
              <div className="col-md-3 mb-2"><label>To</label><input type="date" className="form-control" value={to} onChange={(event) => setTo(event.target.value)} /></div>
              <div className="col-md-3 mb-2">
                <label>Fund</label>
                <select className="form-control" value={fund} onChange={(event) => setFund(event.target.value)}>
                  <option value="all">All funds</option>
                  <option value="tithe">Tithe</option>
                  <option value="offering">Offering</option>
                  <option value="building">Building</option>
                  <option value="missions">Missions</option>
                  <option value="benevolence">Benevolence</option>
                </select>
              </div>
              <div className="col-md-3 mb-2"><label>Giver</label><input className="form-control" value={giver} onChange={(event) => setGiver(event.target.value)} placeholder="Name or email" /></div>
            </div>
            <div className="mt-3">
              <button type="button" className="btn btn-quarternary mr-2" onClick={run}>Generate report</button>
              <button type="button" className="btn btn-tertiary mr-2" onClick={() => download("pdf")}>Export PDF</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => download("csv")}>Export CSV</button>
            </div>
          </div>
          {rows.length ? (
            <div className="panel">
              <p><strong>{rows.length}</strong> gifts · <strong>{kes(total)}</strong></p>
              <table className="table admin-table">
                <thead><tr><th>Date</th><th>Giver</th><th>Fund</th><th>Amount</th><th>Reference</th></tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.ref}>
                      <td>{formatDate(row.createdAt)}</td>
                      <td>{row.name}</td>
                      <td>{row.fund}</td>
                      <td>{kes(row.amount)}</td>
                      <td>{row.ref}</td>
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
