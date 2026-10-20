import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = { title: "Finance dashboard" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin/dashboard");
  if (session.user.role !== "admin") redirect("/");
  return <AdminDashboard />;
}
