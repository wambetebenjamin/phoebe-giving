import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { readStore, updateStore } from "@/lib/store";
import { campaignSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const store = await readStore();
  return NextResponse.json({ campaigns: store.campaigns, funds: store.settings.funds });
}

export async function POST(request: Request) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const json = await request.json().catch(() => null);
  const parsed = campaignSchema.safeParse({
    ...json,
    target: Number(json?.target),
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the campaign form." }, { status: 400 });
  const id = `cmp_${Date.now()}`;
  await updateStore((store) => {
    store.campaigns.unshift({
      id,
      ...parsed.data,
      raised: 0,
      status: "active",
    });
  });
  return NextResponse.json({ id }, { status: 201 });
}
