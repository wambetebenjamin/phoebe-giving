import { auth } from "./auth";
import type { Role } from "./types";

export async function requireSession(role?: Role) {
  const session = await auth();
  if (!session?.user?.email) return { session: null, error: "Sign in is required.", status: 401 as const };
  if (role && session.user.role !== role) return { session: null, error: "This area is for the finance team.", status: 403 as const };
  return { session, error: null, status: 200 as const };
}
