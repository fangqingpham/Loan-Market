import { redirect } from "next/navigation";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";

/** Protects all /borrower routes: must be signed in AND have the borrower role. */
export default async function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "borrower") redirect(dashboardPathFor(profile.role));
  return <>{children}</>;
}
