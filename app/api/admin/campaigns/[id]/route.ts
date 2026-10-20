import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { updateStore } from "@/lib/store";
import { campaignSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  if (json?.status === "closed" || json?.status === "active") {
    await updateStore((store) => {
      const campaign = store.campaigns.find((item) => item.id === id);
      if (campaign) campaign.status = json.status;
    });
    return NextResponse.json({ ok: true });
  }
  const parsed = campaignSchema.safeParse({ ...json, target: Number(json?.target) });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the campaign form." }, { status: 400 });
  let found = false;
  await updateStore((store) => {
    const campaign = store.campaigns.find((item) => item.id === id);
    if (!campaign) return;
    found = true;
    campaign.title = parsed.data.title;
    campaign.fund = parsed.data.fund;
    campaign.target = parsed.data.target;
    campaign.startDate = parsed.data.startDate;
    campaign.endDate = parsed.data.endDate;
    campaign.description = parsed.data.description;
  });
  if (!found) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { id } = await context.params;
  await updateStore((store) => {
    store.campaigns = store.campaigns.filter((item) => item.id !== id);
  });
  return NextResponse.json({ ok: true });
}
