import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CampaignAdmin from "@/components/CampaignAdmin";

export const metadata = { title: "Campaigns" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin/campaigns");
  if (session.user.role !== "admin") redirect("/");
  return <CampaignAdmin />;
}
