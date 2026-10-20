"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PageBanner from "@/components/PageBanner";
import { executeRecaptcha } from "@/lib/recaptcha-client";

type Values = { email: string; password: string };

function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/member/dashboard";
  const form = useForm<Values>({ defaultValues: { email: "", password: "" } });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((response) => response.json())
      .then((providers) => setGoogleReady(Boolean(providers?.google)))
      .catch(() => setGoogleReady(false));
  }, []);

  async function guard() {
    const captcha = await executeRecaptcha("signin");
    const check = await fetch("/api/recaptcha/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(captcha),
    });
    return check.ok;
  }

  async function onSubmit(values: Values) {
    setBusy(true);
    setError("");
    if (!(await guard())) {
      setError("reCAPTCHA could not be verified.");
      setBusy(false);
      return;
    }
    const result = await signIn("credentials", { ...values, redirect: false, callbackUrl });
    setBusy(false);
    if (result?.error) {
      setError("Email or password was not recognised.");
      return;
    }
    window.location.href = callbackUrl;
  }

  async function preview(email: string) {
    setBusy(true);
    if (!(await guard())) {
      setBusy(false);
      setError("reCAPTCHA could not be verified.");
      return;
    }
    const result = await signIn("credentials", {
      email,
      password: "GiveWithCare24",
      redirect: false,
    });
    setBusy(false);
    if (result?.error) {
      setError("Preview sign in failed.");
      return;
    }
    window.location.href = email.startsWith("admin") ? "/admin/dashboard" : callbackUrl;
  }

  return (
    <>
      <PageBanner title="Sign in" crumb="Sign in" />
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="panel">
                <h2 className="h4">Welcome back</h2>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" className="form-control mb-3" {...form.register("email", { required: true })} />
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" className="form-control mb-3" {...form.register("password", { required: true })} />
                  {error ? <p className="text-danger" role="alert">{error}</p> : null}
                  <button type="submit" className="btn btn-quarternary mr-2" disabled={busy}>Sign In</button>
                  {googleReady ? <button type="button" className="btn btn-tertiary" disabled={busy} onClick={() => signIn("google", { callbackUrl })}>Google</button> : <p className="text-muted mt-3 mb-0">Google sign in appears when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.</p>}
                </form>
                <hr />
                <p>Preview access while Google OAuth keys are empty:</p>
                <button type="button" className="btn btn-outline-secondary mr-2 mb-2" onClick={() => preview("grace.wanjiku@phoebecommunity.church")}>Continue as member</button>
                <button type="button" className="btn btn-outline-secondary mb-2" onClick={() => preview("admin@phoebecommunity.church")}>Continue as finance admin</button>
                <p className="mt-3 mb-0">New here? <Link href="/auth/signup">Create a member account</Link></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function SignInPage() {
  return <Suspense fallback={<p className="p-5">Loading sign in.</p>}><SignInForm /></Suspense>;
}
