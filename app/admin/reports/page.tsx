import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReportsAdmin from "@/components/ReportsAdmin";

export const metadata = { title: "Reports" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin/reports");
  if (session.user.role !== "admin") redirect("/");
  return <ReportsAdmin />;
}
