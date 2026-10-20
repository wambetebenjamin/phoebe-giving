import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ ref: string }> }) {
  const { ref } = await context.params;
  const store = await readStore();
  const gift = store.gifts.find((item) => item.ref === ref);
  if (!gift) return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  return NextResponse.json({ gift, settings: store.settings });
}
