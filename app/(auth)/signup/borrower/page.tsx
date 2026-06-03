import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from "@/components/ui";
import { signupBorrowerAction } from "@/app/(auth)/actions";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";
import { PROVINCES, ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Borrower sign up" };

const provinceOptions = [{ value: "", label: "— Province (optional) —" }, ...PROVINCES];

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
          <form action={signupBorrowerAction} className="space-y-4">
            <Input name="full_name" label="Full name" autoComplete="name" />
            <Input name="email" type="email" label="Email" required autoComplete="email" />
            <Input name="password" type="password" label="Password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
            <Input name="phone" type="tel" label="Phone (optional — verification added later)" autoComplete="tel" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="city" label="City (optional)" />
              <Select name="province" label="Province (optional)" options={provinceOptions} />
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 rounded border-slate-300" />
              <span>I agree to the Terms of Service, Privacy Policy, and Disclaimer.</span>
            </label>
            <Button type="submit" className="w-full">Create borrower account</Button>
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
