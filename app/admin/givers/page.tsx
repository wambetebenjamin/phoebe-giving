import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GiversDirectory from "@/components/GiversDirectory";

export const metadata = { title: "Givers" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin/givers");
  if (session.user.role !== "admin") redirect("/");
  return <GiversDirectory />;
}
