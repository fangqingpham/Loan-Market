import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Loan Market connects borrowers with trusted lenders. Borrower contact details stay private until you approve a trusted lender's request.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read the signed-in user's role so the navbar can show a Dashboard link
  // (and Log out) instead of Log in / Sign up. Null when signed out.
  const profile = await getCurrentProfile();
  const dashboardHref = profile ? dashboardPathFor(profile.role) : null;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900">
        <Navbar dashboardHref={dashboardHref} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
