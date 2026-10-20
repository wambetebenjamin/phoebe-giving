import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { updateStore } from "@/lib/store";
import { contactSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the form and try again." }, { status: 400 });
  }
  const captcha = await verifyRecaptcha(parsed.data.recaptchaToken, parsed.data.recaptchaVersion || "v3");
  if (captcha.fallback === "v2") return NextResponse.json({ fallback: "v2" }, { status: 400 });
  if (!captcha.ok) return NextResponse.json({ error: "reCAPTCHA could not be verified." }, { status: 400 });

  await updateStore((store) => {
    store.messages.unshift({
      id: `msg_${Date.now()}`,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "",
      message: parsed.data.message,
      createdAt: new Date().toISOString(),
    });
  });

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_FROM || process.env.SMTP_USER,
      replyTo: parsed.data.email,
      subject: `Phoebe Giving message from ${parsed.data.name}`,
      text: `${parsed.data.message}\n\n${parsed.data.name}\n${parsed.data.email}\n${parsed.data.phone || ""}`,
    });
  }

  return NextResponse.json({ ok: true });
}
