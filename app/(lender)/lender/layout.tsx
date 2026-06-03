import { redirect } from "next/navigation";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";

/**
 * Protects all /lender routes: must be signed in AND have the lender role.
 * Lenders of ANY verification status may access the dashboard; what they can
 * DO inside is gated by verification (here in the UI and by RLS in the DB).
 *
 * Logout + a Dashboard link live in the global top navbar (see app/layout.tsx),
 * so they're available on every lender page without a separate header here.
 */
export default async function LenderLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "lender") redirect(dashboardPathFor(profile.role));
  return <>{children}</>;
}
