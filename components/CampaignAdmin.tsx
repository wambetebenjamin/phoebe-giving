"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PageBanner from "@/components/PageBanner";
import ProgressFill from "@/components/ProgressFill";
import { daysRemaining, kes, percent } from "@/lib/format";
import type { Campaign, FundId } from "@/lib/types";

type Values = {
  title: string;
  fund: FundId;
  target: number;
  startDate: string;
  endDate: string;
  description: string;
};

export default function CampaignAdmin() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const form = useForm<Values>({
    defaultValues: {
      title: "",
      fund: "building",
      target: 100000,
      startDate: "2026-10-20",
      endDate: "2026-12-31",
      description: "",
    },
  });

  async function load() {
    const response = await fetch("/api/admin/campaigns");
    const payload = await response.json();
    if (response.ok) setCampaigns(payload.campaigns);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values: Values) {
    setError("");
    const response = await fetch(editing ? `/api/admin/campaigns/${editing}` : "/api/admin/campaigns", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, target: Number(values.target) }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Could not save the campaign.");
      return;
    }
    setEditing(null);
    form.reset();
    load();
  }

  async function close(id: string) {
    await fetch(`/api/admin/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
    load();
  }

  function edit(campaign: Campaign) {
    setEditing(campaign.id);
    form.reset({
      title: campaign.title,
      fund: campaign.fund,
      target: campaign.target,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      description: campaign.description,
    });
  }

  return (
    <>
      <PageBanner title="Campaigns" crumb="Campaigns" />
      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 mb-4">
              <div className="panel">
                <h2 className="h4">{editing ? "Edit campaign" : "Create a campaign"}</h2>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <label>Title</label>
                  <input className="form-control mb-2" {...form.register("title", { required: true })} />
                  <label>Fund</label>
                  <select className="form-control mb-2" {...form.register("fund")}>
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="building">Building Fund</option>
                    <option value="missions">Missions Fund</option>
                    <option value="benevolence">Benevolence Fund</option>
                  </select>
                  <label>Target amount</label>
                  <input type="number" className="form-control mb-2" {...form.register("target", { valueAsNumber: true })} />
                  <label>Start date</label>
                  <input type="date" className="form-control mb-2" {...form.register("startDate")} />
                  <label>End date</label>
                  <input type="date" className="form-control mb-2" {...form.register("endDate")} />
                  <label>Description</label>
                  <textarea className="form-control mb-3" rows={4} {...form.register("description", { required: true })} />
                  {error ? <p className="text-danger">{error}</p> : null}
                  <button type="submit" className="btn btn-quarternary">{editing ? "Save changes" : "Create campaign"}</button>
                </form>
              </div>
            </div>
            <div className="col-lg-7">
              {campaigns.map((campaign) => {
                const ratio = percent(campaign.raised, campaign.target);
                return (
                  <div className="panel" key={campaign.id}>
                    <div className="d-flex justify-content-between">
                      <h3 className="h5">{campaign.title}</h3>
                      <span>{campaign.status}</span>
                    </div>
                    <p>{campaign.description}</p>
                    <p>{kes(campaign.raised)} of {kes(campaign.target)} · {daysRemaining(campaign.endDate)} days remaining</p>
                    <ProgressFill value={ratio} />
                    <div className="mt-3">
                      <button type="button" className="btn btn-tertiary mr-2" onClick={() => edit(campaign)}>Edit</button>
                      {campaign.status === "active" ? <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => close(campaign.id)}>Close</button> : null}
                      <button type="button" className="btn btn-outline-secondary" onClick={() => remove(campaign.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
