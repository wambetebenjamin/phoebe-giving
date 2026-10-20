"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { executeRecaptcha } from "@/lib/recaptcha-client";

type Values = { name: string; email: string; phone: string; message: string };

export default function ContactForm() {
  const form = useForm<Values>({ defaultValues: { name: "", email: "", phone: "", message: "" } });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(values: Values) {
    setError("");
    setNote("");
    const captcha = await executeRecaptcha("contact");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, recaptchaToken: captcha.token, recaptchaVersion: captcha.version }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "The message could not be sent.");
      return;
    }
    setNote("Thank you. The team has your message.");
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <label htmlFor="contact-name">Name</label>
      <input id="contact-name" className="form-control mb-3" {...form.register("name", { required: true })} />
      <label htmlFor="contact-email">Email</label>
      <input id="contact-email" type="email" className="form-control mb-3" {...form.register("email", { required: true })} />
      <label htmlFor="contact-phone">Phone</label>
      <input id="contact-phone" className="form-control mb-3" {...form.register("phone")} />
      <label htmlFor="contact-message">Message</label>
      <textarea id="contact-message" className="form-control mb-3" rows={5} {...form.register("message", { required: true, minLength: 8 })} />
      {error ? <p className="text-danger" role="alert">{error}</p> : null}
      {note ? <p role="status">{note}</p> : null}
      <button type="submit" className="btn btn-quarternary">Send message</button>
    </form>
  );
}
