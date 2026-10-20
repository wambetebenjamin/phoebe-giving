"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { executeRecaptcha, renderRecaptchaV2 } from "@/lib/recaptcha-client";
import type { FundId, Frequency, PaymentMethod } from "@/lib/types";

type FormValues = {
  fund: FundId;
  amount: number;
  customAmount: string;
  frequency: Frequency;
  name: string;
  phone: string;
  email: string;
  payment: PaymentMethod;
};

const FUNDS: { id: FundId; name: string; description: string }[] = [
  { id: "tithe", name: "Tithe", description: "Support ministry, teaching, and the care of the church." },
  { id: "offering", name: "Offering", description: "A free gift toward weekly worship and hospitality." },
  { id: "building", name: "Building Fund", description: "Help repair the sanctuary and classrooms." },
  { id: "missions", name: "Missions Fund", description: "Partner with outreach across Kenya and East Africa." },
  { id: "benevolence", name: "Benevolence Fund", description: "Quiet help for households in need." },
];

const QUICK = [500, 1000, 2500, 5000];

export default function GivingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { data } = useSession();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsV2, setNeedsV2] = useState(false);
  const [v2Token, setV2Token] = useState("");
  const form = useForm<FormValues>({
    defaultValues: {
      fund: (params.get("fund") as FundId) || "tithe",
      amount: 1000,
      customAmount: "",
      frequency: "one-time",
      name: data?.user?.name || "",
      phone: "",
      email: data?.user?.email || "",
      payment: "mpesa",
    },
  });

  useEffect(() => {
    const fund = params.get("fund") as FundId | null;
    if (fund) form.setValue("fund", fund);
  }, [form, params]);

  useEffect(() => {
    if (data?.user?.name) form.setValue("name", data.user.name);
    if (data?.user?.email) form.setValue("email", data.user.email);
  }, [data, form]);

  const amount = form.watch("amount");
  const fund = form.watch("fund");
  const custom = form.watch("customAmount");
  const member = Boolean(data?.user);

  async function submit(values: FormValues) {
    setError("");
    setBusy(true);
    const chosen = custom ? Number(custom) : values.amount;
    if (!chosen || chosen < 50) {
      setError("Enter an amount of at least KES 50.");
      setBusy(false);
      return;
    }
    if (member && !values.email) {
      setError("Members need an email so the gift can be added to your statement.");
      setBusy(false);
      return;
    }
    try {
      let token = v2Token;
      let version: "v3" | "v2" = v2Token ? "v2" : "v3";
      if (!token) {
        const captcha = await executeRecaptcha("giving_submit");
        token = captcha.token;
        version = captcha.version;
      }
      const response = await fetch("/api/giving/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fund: values.fund,
          amount: chosen,
          frequency: values.frequency,
          name: values.name,
          phone: values.phone,
          email: values.email,
          payment: values.payment,
          member,
          recaptchaToken: token,
          recaptchaVersion: version,
        }),
      });
      const payload = await response.json();
      if (payload.fallback === "v2") {
        setNeedsV2(true);
        setError("Please confirm you are not a robot, then submit again.");
        setBusy(false);
        return;
      }
      if (!response.ok) {
        setError(payload.error || "The gift could not be recorded.");
        setBusy(false);
        return;
      }
      router.push(`/give/confirmation?ref=${payload.ref}`);
    } catch {
      setError("The gift could not be sent. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form className="appointment" onSubmit={form.handleSubmit(submit)} noValidate>
      <div className="step-dots mb-3" aria-hidden="true">
        {[0, 1, 2].map((item) => <span key={item} className={item <= step ? "on" : ""} />)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          {step === 0 ? (
            <div>
              <label htmlFor="fund">Fund</label>
              <select id="fund" className="form-control mb-3" {...form.register("fund")}>
                {FUNDS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <div className="row">
                {FUNDS.map((item) => (
                  <div className="col-md-6 mb-3" key={item.id}>
                    <button
                      type="button"
                      className={`fund-card text-left p-3 w-100 ${fund === item.id ? "is-selected" : ""}`}
                      onClick={() => form.setValue("fund", item.id)}
                    >
                      <strong>{item.name}</strong>
                      <p className="mb-0 text-muted">{item.description}</p>
                    </button>
                  </div>
                ))}
              </div>
              <label>Amount (KES)</label>
              <div className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
                {QUICK.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`amount-chip ${!custom && amount === value ? "is-selected" : ""}`}
                    onClick={() => {
                      form.setValue("amount", value);
                      form.setValue("customAmount", "");
                    }}
                  >
                    KES {value.toLocaleString("en-KE")}
                  </button>
                ))}
                <button type="button" className={`amount-chip ${custom ? "is-selected" : ""}`} onClick={() => form.setValue("customAmount", custom || "")}>
                  Custom
                </button>
              </div>
              <input className="form-control mb-3" inputMode="numeric" placeholder="Custom amount" {...form.register("customAmount")} />
              <label htmlFor="frequency">Giving frequency</label>
              <select id="frequency" className="form-control" {...form.register("frequency")}>
                <option value="one-time">One time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          ) : null}
          {step === 1 ? (
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" className="form-control mb-3" {...form.register("name", { required: true })} />
              <label htmlFor="phone">Phone</label>
              <input id="phone" className="form-control mb-3" placeholder="07xx or 2547xx" {...form.register("phone", { required: true })} />
              <label htmlFor="email">Email {member ? "(required for members)" : "(optional for guests)"}</label>
              <input id="email" type="email" className="form-control" {...form.register("email")} />
            </div>
          ) : null}
          {step === 2 ? (
            <div>
              <p className="mb-2">Pay with M-Pesa STK push or card. You will receive a reference and receipt immediately.</p>
              <label className="d-block mb-2">
                <input type="radio" value="mpesa" {...form.register("payment")} className="mr-2" />
                M-Pesa STK push
              </label>
              <label className="d-block mb-3">
                <input type="radio" value="card" {...form.register("payment")} className="mr-2" />
                Card
              </label>
              {form.watch("payment") === "mpesa" ? (
                <p className="text-muted">A prompt will be sent to the phone number above. Confirm with your M-Pesa PIN. Paybill and account details appear on the receipt.</p>
              ) : (
                <p className="text-muted">Card payments are confirmed in this preview without storing the full card number.</p>
              )}
              {needsV2 ? <V2Box onToken={setV2Token} /> : null}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
      {error ? <p className="text-danger mt-3" role="alert">{error}</p> : null}
      <div className="d-flex justify-content-between mt-4">
        {step > 0 ? (
          <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((value) => value - 1)}>Back</button>
        ) : <span />}
        {step < 2 ? (
          <button type="button" className="btn btn-quarternary" onClick={() => setStep((value) => value + 1)}>Continue</button>
        ) : (
          <button type="submit" className="btn btn-quarternary" disabled={busy}>{busy ? "Sending" : "Give Now"}</button>
        )}
      </div>
    </form>
  );
}

function V2Box({ onToken }: { onToken: (token: string) => void }) {
  useEffect(() => {
    const el = document.getElementById("recaptcha-v2");
    if (!el) return;
    renderRecaptchaV2(el).then(onToken).catch(() => onToken(""));
  }, [onToken]);
  return <div id="recaptcha-v2" className="mt-3" />;
}
