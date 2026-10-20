import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberDashboard from "@/components/MemberDashboard";

export const metadata = { title: "My giving" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/member/dashboard");
  return <MemberDashboard />;
}
