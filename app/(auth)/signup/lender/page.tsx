import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { LenderSignupForm } from "@/components/auth/LenderSignupForm";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";
import {
  LENDER_TYPES,
  PROVINCES,
  ROUTES,
  PRIVATE_LENDERS_ENABLED,
  LICENSED_LENDER_TYPES,
  LENDER_INTAKE_NOTE,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Lender / Broker sign up" };

// While private lenders are not enabled, only licensed lender types may register.
const availableLenderTypes = PRIVATE_LENDERS_ENABLED
  ? LENDER_TYPES
  : LENDER_TYPES.filter((t) => LICENSED_LENDER_TYPES.includes(t.value));
const lenderTypeOptions = [{ value: "", label: "Select your type" }, ...availableLenderTypes];
const provinceOptions = [{ value: "", label: "— Primary province (optional) —" }, ...PROVINCES];

export default async function LenderSignupPage({
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
          <CardTitle>Sign up as a lender / broker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            For lenders and mortgage brokers. Mortgage brokers and agents provide a licence
            number, which is shown on listings as self-reported so borrowers can confirm it with
            the regulator themselves. Banks, credit unions, and financing companies are verified
            differently and don&apos;t supply a licence number. Loan Market does not verify or
            endorse lenders or brokers.
          </p>
          {searchParams?.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}
          <LenderSignupForm
            lenderTypeOptions={lenderTypeOptions}
            provinceOptions={provinceOptions}
            intakeNote={LENDER_INTAKE_NOTE}
          />
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-medium text-brand-700 hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
