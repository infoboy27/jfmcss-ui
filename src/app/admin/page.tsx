import type { Metadata } from "next";
import { cookies } from "next/headers";
import AdminPortfolio from "@/components/AdminPortfolio";
import AdminLogin from "@/components/AdminLogin";
import { isConfigured, SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin — Portafolio JFMCSS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  const authed = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  return authed ? <AdminPortfolio /> : <AdminLogin configured={isConfigured()} />;
}
