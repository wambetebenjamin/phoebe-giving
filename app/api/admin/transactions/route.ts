import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { readStore } from "@/lib/store";
import type { Gift } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(5, Number(url.searchParams.get("pageSize") || 8)));
  const sort = url.searchParams.get("sort") || "date";
  const dir = url.searchParams.get("dir") === "asc" ? 1 : -1;
  const fund = url.searchParams.get("fund") || "all";
  const store = await readStore();
  let rows = store.gifts.filter((gift) => (fund === "all" ? true : gift.fund === fund));
  rows = [...rows].sort((a, b) => compare(a, b, sort) * dir);
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return NextResponse.json({
    rows: rows.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

function compare(a: Gift, b: Gift, sort: string) {
  if (sort === "amount") return a.amount - b.amount;
  if (sort === "fund") return a.fund.localeCompare(b.fund);
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}
