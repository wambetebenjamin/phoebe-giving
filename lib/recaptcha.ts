export type RecaptchaResult = {
  ok: boolean;
  score?: number;
  fallback?: "v2";
  demo?: boolean;
  reason?: string;
};

export async function verifyRecaptcha(token: string, version: "v3" | "v2" = "v3"): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    if (!token) return { ok: false, reason: "missing-token" };
    return { ok: true, score: 1, demo: true };
  }
  if (!token || token === "demo") return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret, response: token });
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await response.json()) as { success?: boolean; score?: number; "error-codes"?: string[] };
  if (!data.success) return { ok: false, reason: "failed" };
  const score = typeof data.score === "number" ? data.score : 1;
  if (version !== "v2" && score < 0.5) return { ok: false, fallback: "v2", score };
  return { ok: true, score };
}
