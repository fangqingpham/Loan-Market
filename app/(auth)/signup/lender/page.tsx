import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from "@/components/ui";
import { signupLenderAction } from "@/app/(auth)/actions";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";
import {
  LENDER_TYPES,
  PROVINCES,
  ROUTES,
  PRIVATE_LENDERS_ENABLED,
  LICENSED_LENDER_TYPES,
  LENDER_INTAKE_NOTE,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Lender sign up" };

// While private lenders are not enabled, only licensed lender types may register.
const availableLenderTypes = PRIVATE_LENDERS_ENABLED
  ? LENDER_TYPES
  : LENDER_TYPES.filter((t) => LICENSED_LENDER_TYPES.includes(t.value));
const lenderTypeOptions = [{ value: "", label: "Select lender type" }, ...availableLenderTypes];
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
          <CardTitle>Sign up as a lender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            For licensed lenders. Provide your licence number so it can be shown on your
            listings as self-reported — borrowers confirm it with the regulator themselves.
            Loan Market does not verify or endorse lenders.
          </p>
          {searchParams?.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}
          <form action={signupLenderAction} className="space-y-4">
            <Input name="email" type="email" label="Account email" required autoComplete="email" />
            <Input name="password" type="password" label="Password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
            <Input name="business_name" label="Business name" required />
            <Input name="legal_name" label="Legal name (optional)" />
            <Select name="lender_type" label="Lender type" options={lenderTypeOptions} required />
            <Input name="business_email" type="email" label="Business email (optional)" />
            <Input name="phone" type="tel" label="Business phone (optional)" autoComplete="tel" />
            <Input name="website_or_social" label="Website or social (optional)" />
            <Input name="brokerage_or_company_name" label="Brokerage / company name (optional)" />
            <Input name="licence_number" label="Licence / registration number" required placeholder="Your regulator licence or registration number" />
            <Select name="province" label="Primary operating province (optional)" options={provinceOptions} />
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {LENDER_INTAKE_NOTE}
            </p>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 rounded border-slate-300" />
              <span>I agree to the Terms of Service, Privacy Policy, and Disclaimer.</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" name="agree_rules" required className="mt-0.5 h-4 w-4 rounded border-slate-300" />
              <span>I agree to the platform rules (no upfront fees, interest-rate compliance, honest conduct).</span>
            </label>
            <Button type="submit" className="w-full">Create lender account</Button>
          </form>
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-medium text-brand-700 hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
