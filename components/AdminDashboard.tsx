"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ChartsPanel from "@/components/ChartsPanel";
import CountUp from "@/components/CountUp";
import PageBanner from "@/components/PageBanner";
import ProgressFill from "@/components/ProgressFill";
import { daysRemaining, formatDate, kes, percent, toCsv } from "@/lib/format";
import type { Campaign, Gift } from "@/lib/types";

type Stats = {
  kpis: { monthTotal: number; yearTotal: number; uniqueGivers: number; averageGift: number };
  monthly: { month: string; total: number }[];
  byFund: { fund: string; total: number }[];
  pie: { name: string; value: number }[];
  weekly: { week: string; total: number }[];
  topGivers: { initials: string; total: number }[];
  campaigns: Campaign[];
};

type Tx = { rows: Gift[]; page: number; pages: number; total: number };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tx, setTx] = useState<Tx | null>(null);
  const [sort, setSort] = useState("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then(async (response) => {
      const payload = await response.json();
      if (!response.ok) setError(payload.error || "Could not load stats.");
      else setStats(payload);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/admin/transactions?page=${page}&sort=${sort}&dir=${dir}`).then(async (response) => {
      const payload = await response.json();
      if (response.ok) setTx(payload);
    });
  }, [page, sort, dir]);

  function toggle(next: string) {
    if (sort === next) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(next);
      setDir("desc");
    }
    setPage(1);
  }

  async function exportPdf() {
    const node = document.getElementById("admin-view");
    if (!node) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(node, { scale: 1.4, backgroundColor: "#ffffff" });
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, width, Math.min(height, 270));
    pdf.save("phoebe-giving-dashboard.pdf");
  }

  function exportCsv() {
    if (!tx) return;
    const csv = toCsv(tx.rows.map((row) => ({
      date: row.createdAt,
      fund: row.fund,
      amount: row.amount,
      reference: row.ref,
      name: row.name,
    })));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "phoebe-giving-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageBanner title="Finance dashboard" crumb="Admin" />
      <section className="ftco-section">
        <div className="container" id="admin-view">
          <div className="d-flex flex-wrap justify-content-between mb-3" style={{ gap: 8 }}>
            <div>
              <Link href="/admin/givers" className="mr-3">Givers</Link>
              <Link href="/admin/campaigns" className="mr-3">Campaigns</Link>
              <Link href="/admin/reports" className="mr-3">Reports</Link>
              <Link href="/admin/settings">Settings</Link>
            </div>
            <div>
              <button type="button" className="btn btn-tertiary mr-2" onClick={exportPdf}>Download PDF</button>
              <button type="button" className="btn btn-quarternary" onClick={exportCsv}>Download CSV</button>
            </div>
          </div>
          {error ? <p className="text-danger">{error}</p> : null}
          {stats ? (
            <>
              <div className="row mb-4">
                <Kpi label="Received this month" value={stats.kpis.monthTotal} money />
                <Kpi label="Received this year" value={stats.kpis.yearTotal} money />
                <Kpi label="Unique givers this month" value={stats.kpis.uniqueGivers} />
                <Kpi label="Average gift size" value={stats.kpis.averageGift} money />
              </div>
              <ChartsPanel monthly={stats.monthly} byFund={stats.byFund} pie={stats.pie} weekly={stats.weekly} />
              <div className="panel">
                <h2 className="h4">Recent transactions</h2>
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th><button type="button" className="btn btn-link p-0" onClick={() => toggle("date")}>Date</button></th>
                        <th><button type="button" className="btn btn-link p-0" onClick={() => toggle("fund")}>Fund</button></th>
                        <th><button type="button" className="btn btn-link p-0" onClick={() => toggle("amount")}>Amount</button></th>
                        <th>Reference</th>
                        <th>Giver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tx?.rows.map((row) => (
                        <tr key={row.ref}>
                          <td>{formatDate(row.createdAt)}</td>
                          <td>{row.fund}</td>
                          <td>{kes(row.amount)}</td>
                          <td>{row.ref}</td>
                          <td>{row.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                  <span>Page {tx?.page || 1} of {tx?.pages || 1}</span>
                  <button type="button" className="btn btn-outline-secondary" disabled={!tx || page >= tx.pages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-7">
                  <div className="panel">
                    <h2 className="h4">Campaign tracker</h2>
                    {stats.campaigns.filter((item) => item.status === "active").map((campaign) => {
                      const ratio = percent(campaign.raised, campaign.target);
                      return (
                        <div key={campaign.id} className="mb-3">
                          <div className="d-flex justify-content-between">
                            <strong>{campaign.title}</strong>
                            <span>{daysRemaining(campaign.endDate)} days remaining</span>
                          </div>
                          <p className="mb-1">{kes(campaign.raised)} of {kes(campaign.target)} · {ratio}%</p>
                          <ProgressFill value={ratio} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="panel">
                    <h2 className="h4">Top givers this month</h2>
                    <p className="text-muted">Shown as initials only.</p>
                    <ul className="list-unstyled">
                      {stats.topGivers.map((giver) => (
                        <li key={giver.initials + giver.total} className="d-flex justify-content-between border-bottom py-2">
                          <span>{giver.initials}</span>
                          <strong>{kes(giver.total)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : !error ? <p>Loading the dashboard.</p> : null}
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, money }: { label: string; value: number; money?: boolean }) {
  return (
    <div className="col-md-6 col-lg-3 mb-3">
      <div className="kpi-card">
        <p className="text-muted mb-1">{label}</p>
        <h3 className="mb-0"><CountUp value={value} prefix={money ? "KES " : ""} /></h3>
      </div>
    </div>
  );
}
