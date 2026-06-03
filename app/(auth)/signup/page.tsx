import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";
import { APP_NAME, ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(dashboardPathFor(profile.role));

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-slate-600">Choose how you&apos;ll use {APP_NAME}.</p>
      </div>
      <div className="mx-auto mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>I&apos;m a borrower</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Post a loan request and stay anonymous. Your contact details are never shown —
              you approve who gets to message you.
            </p>
            <Link href={ROUTES.signupBorrower}>
              <Button className="w-full">Sign up as borrower</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>I&apos;m a lender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Apply as a lender. Accounts are manually verified before you can browse borrower
              requests or post listings.
            </p>
            <Link href={ROUTES.signupLender}>
              <Button variant="outline" className="w-full">Sign up as lender</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-brand-700 hover:underline">Log in</Link>
      </p>
    </Container>
  );
}
