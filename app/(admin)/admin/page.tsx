import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin" };

const tools: { label: string; desc: string; href?: string }[] = [
  { label: "Lender Verification", desc: "Review and approve, reject, or suspend lender accounts.", href: ROUTES.adminLenders },
  { label: "Reports", desc: "Review reported users, listings, and conversations.", href: ROUTES.adminReports },
  { label: "Users", desc: "Browse borrowers and lenders; manage access." },
];

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  const name = profile?.fullName || "admin";

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Signed in as {name}.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Card key={t.label}>
            <CardHeader>
              <CardTitle>{t.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{t.desc}</p>
              {t.href ? (
                <Link href={t.href}>
                  <Button variant="outline" size="sm">Open</Button>
                </Link>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Coming soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
