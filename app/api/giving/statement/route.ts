import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { buildStatement } from "@/lib/pdf";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const gate = await requireSession();
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const url = new URL(request.url);
  const year = Number(url.searchParams.get("year") || new Date().getUTCFullYear());
  const format = url.searchParams.get("format");
  const store = await readStore();
  const email = gate.session.user.email?.toLowerCase() || "";
  const gifts = store.gifts.filter((gift) => {
    const mine = gift.email.toLowerCase() === email || gift.userId === gate.session!.user.id;
    return mine && new Date(gift.createdAt).getUTCFullYear() === year;
  });
  if (format === "pdf") {
    const doc = buildStatement(gate.session.user.name || "Member", year, gifts, store.settings);
    const bytes = doc.output("arraybuffer");
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="phoebe-giving-statement-${year}.pdf"`,
      },
    });
  }
  return NextResponse.json({
    year,
    name: gate.session.user.name,
    gifts,
    total: gifts.reduce((sum, gift) => sum + gift.amount, 0),
    churchName: store.settings.churchName,
  });
}
