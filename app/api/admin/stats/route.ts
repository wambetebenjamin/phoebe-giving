import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { dashboardStats } from "@/lib/stats";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const store = await readStore();
  return NextResponse.json(dashboardStats(store));
}
