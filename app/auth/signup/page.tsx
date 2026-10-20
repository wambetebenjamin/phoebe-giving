"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PageBanner from "@/components/PageBanner";
import { executeRecaptcha } from "@/lib/recaptcha-client";

type Values = { name: string; email: string; phone: string; password: string };

export default function SignUpPage() {
  const form = useForm<Values>({ defaultValues: { name: "", email: "", phone: "", password: "" } });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((response) => response.json())
      .then((providers) => setGoogleReady(Boolean(providers?.google)))
      .catch(() => setGoogleReady(false));
  }, []);

  async function onSubmit(values: Values) {
    setBusy(true);
    setError("");
    const captcha = await executeRecaptcha("signup");
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, recaptchaToken: captcha.token, recaptchaVersion: captcha.version }),
    });
    const payload = await response.json();
    if (payload.fallback === "v2") {
      setError("Please complete the extra check and try again.");
      setBusy(false);
      return;
    }
    if (!response.ok) {
      setError(payload.error || "Account could not be created.");
      setBusy(false);
      return;
    }
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    setBusy(false);
    if (result?.error) {
      window.location.href = "/auth/signin";
      return;
    }
    window.location.href = "/member/dashboard";
  }

  return (
    <>
      <PageBanner title="Create an account" crumb="Sign up" />
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="panel">
                <h2 className="h4">Join as a member</h2>
                <p>New accounts start as members. Finance admin access is assigned by the church team.</p>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <label htmlFor="name">Name</label>
                  <input id="name" className="form-control mb-3" {...form.register("name", { required: true })} />
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" className="form-control mb-3" {...form.register("email", { required: true })} />
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" className="form-control mb-3" {...form.register("phone", { required: true })} />
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" className="form-control mb-3" {...form.register("password", { required: true, minLength: 8 })} />
                  {error ? <p className="text-danger" role="alert">{error}</p> : null}
                  <button type="submit" className="btn btn-quarternary mr-2" disabled={busy}>Create account</button>
                  {googleReady ? <button type="button" className="btn btn-tertiary" onClick={() => signIn("google", { callbackUrl: "/member/dashboard" })}>Google</button> : null}
                </form>
                <p className="mt-3 mb-0">Already registered? <Link href="/auth/signin">Sign in</Link></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
