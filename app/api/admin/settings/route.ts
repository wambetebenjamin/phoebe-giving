import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { requireSession } from "@/lib/guard";
import { readStore, updateStore } from "@/lib/store";
import { settingsSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const store = await readStore();
  return NextResponse.json({
    settings: store.settings,
    users: store.users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })),
  });
}

export async function PUT(request: Request) {
  const gate = await requireSession("admin");
  if (!gate.session) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("logo");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a logo file." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    let logoUrl = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`logos/${Date.now()}-${file.name}`, bytes, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || "image/png",
      });
      logoUrl = blob.url;
    } else {
      const folder = path.join(process.cwd(), "public", "uploads");
      mkdirSync(folder, { recursive: true });
      const filename = `logo-${Date.now()}${path.extname(file.name) || ".png"}`;
      writeFileSync(path.join(folder, filename), bytes);
      logoUrl = `/uploads/${filename}`;
    }
    await updateStore((store) => {
      store.settings.logoUrl = logoUrl;
    });
    return NextResponse.json({ logoUrl });
  }

  const json = await request.json().catch(() => null);
  if (json?.userId && json?.role) {
    await updateStore((store) => {
      const user = store.users.find((item) => item.id === json.userId);
      if (user && (json.role === "admin" || json.role === "member")) user.role = json.role;
    });
    return NextResponse.json({ ok: true });
  }
  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the settings." }, { status: 400 });
  await updateStore((store) => {
    store.settings.churchName = parsed.data.churchName;
    store.settings.mpesaPaybill = parsed.data.mpesaPaybill;
    store.settings.accountPrefix = parsed.data.accountPrefix;
    store.settings.emailNotifications = parsed.data.emailNotifications;
    store.settings.funds = parsed.data.funds;
  });
  return NextResponse.json({ ok: true });
}
