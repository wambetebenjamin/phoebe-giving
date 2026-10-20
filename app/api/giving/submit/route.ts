import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { updateStore } from "@/lib/store";
import { givingSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = givingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the form and try again." }, { status: 400 });
  }
  const captcha = await verifyRecaptcha(parsed.data.recaptchaToken, parsed.data.recaptchaVersion || "v3");
  if (captcha.fallback === "v2") return NextResponse.json({ fallback: "v2", error: "Confirm the extra check." }, { status: 400 });
  if (!captcha.ok) return NextResponse.json({ error: "reCAPTCHA could not be verified." }, { status: 400 });

  const session = await auth();
  if ((parsed.data.member || session?.user) && !parsed.data.email) {
    return NextResponse.json({ error: "Email is required for members." }, { status: 400 });
  }

  const ref = `PG${new Date().getUTCFullYear().toString().slice(2)}${Math.floor(10000 + Math.random() * 89999)}`;
  const recurring = parsed.data.frequency !== "one-time";
  await updateStore((store) => {
    const user = store.users.find((item) => item.email.toLowerCase() === (parsed.data.email || "").toLowerCase());
    store.gifts.unshift({
      ref,
      fund: parsed.data.fund,
      amount: parsed.data.amount,
      frequency: parsed.data.frequency,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || "",
      payment: parsed.data.payment,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      userId: session?.user?.id || user?.id,
      recurringId: recurring ? `rec_${Date.now()}` : undefined,
      recurringStatus: recurring ? "active" : undefined,
    });
    const campaign = store.campaigns.find((item) => item.fund === parsed.data.fund && item.status === "active");
    if (campaign) campaign.raised += parsed.data.amount;
  });

  return NextResponse.json({
    ref,
    fund: parsed.data.fund,
    amount: parsed.data.amount,
    frequency: parsed.data.frequency,
    payment: parsed.data.payment,
    message: parsed.data.payment === "mpesa" ? "M-Pesa prompt recorded for this phone." : "Card gift recorded.",
  });
}
