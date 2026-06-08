import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BorrowerSignupForm } from "@/components/auth/BorrowerSignupForm";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";
import { PROVINCES, ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Borrower sign up" };

const provinceOptions = [{ value: "", label: "- Province (optional) -" }, ...PROVINCES];

export default async function BorrowerSignupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const profile = await getCurrentProfile();
  if (profile) redirect(dashboardPathFor(profile.role));

  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Sign up as a borrower</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams?.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}
          <BorrowerSignupForm provinceOptions={provinceOptions} />
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-medium text-brand-700 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
