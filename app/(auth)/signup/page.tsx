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
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>I&apos;m a borrower</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <p className="text-sm text-slate-600">
              Post a loan request and stay anonymous. Your contact details are never shown —
              you approve who gets to message you.
            </p>
            <Link href={ROUTES.signupBorrower} className="mt-auto block pt-4">
              <Button className="w-full">Sign up as borrower</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle>I&apos;m a lender / broker</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <p className="text-sm text-slate-600">
              Apply as a lender or mortgage broker. List your products and connect with borrowers
              who approve your contact request.
            </p>
            <Link href={ROUTES.signupLender} className="mt-auto block pt-4">
              <Button variant="outline" className="w-full">Sign up as lender / broker</Button>
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
