"use client";

import { useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import type { Fund, Role } from "@/lib/types";

type UserRow = { id: string; name: string; email: string; role: Role };

export default function SettingsAdmin() {
  const [churchName, setChurchName] = useState("");
  const [paybill, setPaybill] = useState("");
  const [prefix, setPrefix] = useState("");
  const [emailOn, setEmailOn] = useState(true);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then(async (response) => {
      const payload = await response.json();
      if (!response.ok) return;
      setChurchName(payload.settings.churchName);
      setPaybill(payload.settings.mpesaPaybill);
      setPrefix(payload.settings.accountPrefix);
      setEmailOn(payload.settings.emailNotifications);
      setFunds(payload.settings.funds);
      setLogoUrl(payload.settings.logoUrl);
      setUsers(payload.users);
    });
  }, []);

  async function save() {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        churchName,
        mpesaPaybill: paybill,
        accountPrefix: prefix,
        emailNotifications: emailOn,
        funds,
      }),
    });
    setNote(response.ok ? "Settings saved." : "Settings could not be saved.");
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set("logo", file);
    const response = await fetch("/api/admin/settings", { method: "PUT", body });
    const payload = await response.json();
    if (response.ok) {
      setLogoUrl(payload.logoUrl);
      setNote("Logo uploaded.");
    } else setNote(payload.error || "Logo upload failed.");
  }

  async function setRole(userId: string, role: Role) {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)));
  }

  return (
    <>
      <PageBanner title="Church settings" crumb="Settings" />
      <section className="ftco-section">
        <div className="container">
          <div className="panel">
            <label>Church name</label>
            <input className="form-control mb-3" value={churchName} onChange={(event) => setChurchName(event.target.value)} />
            <label>Logo</label>
            <div className="mb-3">
              {logoUrl ? <img src={logoUrl} alt="Church logo" style={{ height: 64, marginBottom: 8 }} /> : <p className="text-muted">No logo uploaded yet.</p>}
              <input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} />
            </div>
            <label>M-Pesa paybill or till</label>
            <input className="form-control mb-3" value={paybill} onChange={(event) => setPaybill(event.target.value)} />
            <label>Account prefix</label>
            <input className="form-control mb-3" value={prefix} onChange={(event) => setPrefix(event.target.value)} />
            <label className="d-flex align-items-center mb-3">
              <input type="checkbox" className="mr-2" checked={emailOn} onChange={(event) => setEmailOn(event.target.checked)} />
              Email notifications
            </label>
            <h3 className="h5">Fund names</h3>
            {funds.map((fund, index) => (
              <div className="mb-2" key={fund.id}>
                <input
                  className="form-control mb-1"
                  value={fund.name}
                  onChange={(event) => {
                    const next = [...funds];
                    next[index] = { ...fund, name: event.target.value };
                    setFunds(next);
                  }}
                />
                <textarea
                  className="form-control"
                  rows={2}
                  value={fund.description}
                  onChange={(event) => {
                    const next = [...funds];
                    next[index] = { ...fund, description: event.target.value };
                    setFunds(next);
                  }}
                />
              </div>
            ))}
            <button type="button" className="btn btn-quarternary mt-3" onClick={save}>Save settings</button>
            {note ? <p className="mt-2" role="status">{note}</p> : null}
          </div>
          <div className="panel">
            <h2 className="h4">Roles</h2>
            <p>New accounts join as members. Admin access is assigned here.</p>
            <table className="table admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select className="form-control" value={user.role} onChange={(event) => setRole(user.id, event.target.value as Role)}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
