import { NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token || "");
  const version = body?.version === "v2" ? "v2" : "v3";
  if (!token) return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  const result = await verifyRecaptcha(token, version);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
