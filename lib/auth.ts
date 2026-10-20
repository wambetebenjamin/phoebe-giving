import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "./types";
import { hashPassword } from "./seed";
import { readStore } from "./store";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

providers.push(
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email || "").toLowerCase().trim();
      const password = String(credentials?.password || "");
      if (!email || !password) return null;
      const store = await readStore();
      const user = store.users.find((item) => item.email.toLowerCase() === email);
      if (!user || user.passwordHash !== hashPassword(password)) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "phoebe-giving-preview-secret",
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true;
      const { updateStore } = await import("./store");
      await updateStore((store) => {
        const existing = store.users.find((item) => item.email.toLowerCase() === user.email!.toLowerCase());
        if (existing) return;
        store.users.push({
          id: `usr_${Date.now()}`,
          name: user.name || "Member",
          email: user.email!.toLowerCase(),
          phone: "",
          role: "member",
          passwordHash: "",
          createdAt: new Date().toISOString(),
        });
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = ((user as { role?: Role }).role || "member") as Role;
        token.id = user.id;
      }
      if (token.email) {
        const store = await readStore();
        const fresh = store.users.find((item) => item.email.toLowerCase() === String(token.email).toLowerCase());
        if (fresh) {
          token.role = fresh.role;
          token.id = fresh.id;
          token.name = fresh.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as Role) || "member";
        session.user.id = String(token.id || "");
      }
      return session;
    },
  },
});
