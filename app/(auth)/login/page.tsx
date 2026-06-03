import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { loginAction } from "@/app/(auth)/actions";
import { getCurrentProfile, dashboardPathFor } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; message?: string };
}) {
  const profile = await getCurrentProfile();
  if (profile) redirect(dashboardPathFor(profile.role));

  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams?.message && (
            <div className="rounded-xl border border-verified-200 bg-verified-50 px-3 py-2 text-sm text-verified-700">
              {searchParams.message}
            </div>
          )}
          {searchParams?.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}
          <form action={loginAction} className="space-y-4">
            <Input name="email" type="email" label="Email" required autoComplete="email" />
            <Input name="password" type="password" label="Password" required autoComplete="current-password" />
            <Button type="submit" className="w-full">Log in</Button>
          </form>
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.signup} className="font-medium text-brand-700 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
