import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { filterGifts } from "@/lib/stats";
import { readStore } from "@/lib/store";
import { toCsv } from "@/lib/format";
import { buildStatement } from "@/lib/pdf";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const url = new URL(request.url);
  const store = await readStore();
  const gifts = filterGifts(store.gifts, {
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    fund: url.searchParams.get("fund") || undefined,
    giver: url.searchParams.get("giver") || undefined,
  });
  const format = url.searchParams.get("format");
  const total = gifts.reduce((sum, gift) => sum + gift.amount, 0);
  if (format === "csv") {
    const csv = toCsv(gifts.map((gift) => ({
      date: gift.createdAt,
      name: gift.name,
      email: gift.email,
      fund: gift.fund,
      amount: gift.amount,
      frequency: gift.frequency,
      reference: gift.ref,
      payment: gift.payment,
    })));
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=phoebe-giving-report.csv",
      },
    });
  }
  if (format === "pdf") {
    const doc = buildStatement("Finance report", new Date().getUTCFullYear(), gifts, store.settings);
    return new NextResponse(Buffer.from(doc.output("arraybuffer")), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=phoebe-giving-report.pdf",
      },
    });
  }
  return NextResponse.json({ gifts, total, count: gifts.length });
}
