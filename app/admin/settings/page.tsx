import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsAdmin from "@/components/SettingsAdmin";

export const metadata = { title: "Settings" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin/settings");
  if (session.user.role !== "admin") redirect("/");
  return <SettingsAdmin />;
}
