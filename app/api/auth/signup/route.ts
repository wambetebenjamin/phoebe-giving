import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/seed";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { updateStore, readStore } from "@/lib/store";
import { signupSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the form and try again." }, { status: 400 });
  }
  const captcha = await verifyRecaptcha(parsed.data.recaptchaToken, parsed.data.recaptchaVersion || "v3");
  if (captcha.fallback === "v2") return NextResponse.json({ fallback: "v2" }, { status: 400 });
  if (!captcha.ok) return NextResponse.json({ error: "reCAPTCHA could not be verified." }, { status: 400 });

  const store = await readStore();
  if (store.users.some((user) => user.email.toLowerCase() === parsed.data.email.toLowerCase())) {
    return NextResponse.json({ error: "An account with that email already exists. Sign in instead." }, { status: 409 });
  }
  await updateStore((current) => {
    current.users.push({
      id: `usr_${Date.now()}`,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      role: "member",
      passwordHash: hashPassword(parsed.data.password),
      createdAt: new Date().toISOString(),
    });
  });
  return NextResponse.json({ ok: true, role: "member" });
}
