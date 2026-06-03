import { redirect } from "next/navigation";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";

/** Protects all /admin routes: must be signed in AND have the admin role. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(dashboardPathFor(profile.role));
  return <>{children}</>;
}
