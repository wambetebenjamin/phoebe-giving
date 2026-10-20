import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { memberSummary } from "@/lib/stats";
import { updateStore, readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireSession();
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const email = gate.session.user.email?.toLowerCase() || "";
  const store = await readStore();
  const gifts = store.gifts.filter((gift) => gift.email.toLowerCase() === email || gift.userId === gate.session.user.id);
  const recurring = gifts.filter((gift) => gift.recurringId && gift.recurringStatus && gift.recurringStatus !== "cancelled");
  const unique = new Map<string, (typeof gifts)[number]>();
  recurring.forEach((gift) => {
    if (gift.recurringId && !unique.has(gift.recurringId)) unique.set(gift.recurringId, gift);
  });
  return NextResponse.json({
    gifts,
    summary: memberSummary(gifts),
    recurring: [...unique.values()],
    settings: store.settings,
    user: { name: gate.session.user.name, email },
  });
}

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const body = await request.json().catch(() => null);
  const id = String(body?.recurringId || "");
  const action = String(body?.action || "");
  const amount = Number(body?.amount || 0);
  if (!id || !["pause", "cancel", "resume", "adjust"].includes(action)) {
    return NextResponse.json({ error: "Choose pause, cancel, or adjust." }, { status: 400 });
  }
  await updateStore((store) => {
    store.gifts.forEach((gift) => {
      if (gift.recurringId !== id) return;
      if (gift.userId !== gate.session!.user.id && gift.email.toLowerCase() !== gate.session!.user.email?.toLowerCase()) return;
      if (action === "pause") gift.recurringStatus = "paused";
      if (action === "resume") gift.recurringStatus = "active";
      if (action === "cancel") gift.recurringStatus = "cancelled";
      if (action === "adjust" && amount >= 50) gift.amount = amount;
    });
  });
  return NextResponse.json({ ok: true });
}
