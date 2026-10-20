import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { readStore } from "@/lib/store";
import type { Gift } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();
  const fund = url.searchParams.get("fund") || "all";
  const frequency = url.searchParams.get("frequency") || "all";
  const min = Number(url.searchParams.get("min") || 0);
  const max = Number(url.searchParams.get("max") || 0);
  const email = url.searchParams.get("email") || "";
  const store = await readStore();

  const grouped = new Map<string, { name: string; email: string; phone: string; total: number; lastGift: string; recurring: string; gifts: Gift[] }>();
  store.gifts.forEach((gift) => {
    const key = gift.email || gift.phone;
    const current = grouped.get(key) || {
      name: gift.name,
      email: gift.email,
      phone: gift.phone,
      total: 0,
      lastGift: gift.createdAt,
      recurring: "none",
      gifts: [],
    };
    current.total += gift.amount;
    current.gifts.push(gift);
    if (new Date(gift.createdAt) > new Date(current.lastGift)) current.lastGift = gift.createdAt;
    if (gift.recurringStatus === "active") current.recurring = "active";
    else if (gift.recurringStatus === "paused" && current.recurring !== "active") current.recurring = "paused";
    grouped.set(key, current);
  });

  let rows = [...grouped.values()];
  if (q) rows = rows.filter((row) => `${row.name} ${row.email} ${row.phone}`.toLowerCase().includes(q));
  if (fund !== "all") rows = rows.filter((row) => row.gifts.some((gift) => gift.fund === fund));
  if (frequency !== "all") rows = rows.filter((row) => row.gifts.some((gift) => gift.frequency === frequency));
  if (min) rows = rows.filter((row) => row.total >= min);
  if (max) rows = rows.filter((row) => row.total <= max);
  rows.sort((a, b) => b.total - a.total);

  if (email) {
    const match = rows.find((row) => row.email === email || row.phone === email);
    return NextResponse.json({ giver: match || null });
  }

  return NextResponse.json({
    rows: rows.map(({ gifts, ...row }) => row),
  });
}
