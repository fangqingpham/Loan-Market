import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { LenderVerificationForm, type LenderVerificationValues } from "@/components/forms";
import { submitLenderVerificationAction } from "@/app/(lender)/lender/actions";
import { getLenderProfile } from "@/lib/auth";
import { lenderTypeRequiresLicence } from "@/lib/licence-check";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Lender details" };

export default async function LenderVerificationPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const profile = await getLenderProfile();

  // This form is for PRIVATE lenders only. Licensed lenders provide a licence
  // number at signup, so send them back to the dashboard.
  if (profile && lenderTypeRequiresLicence(profile.lender_type) && !profile.is_private_lender) {
    redirect(
      `${ROUTES.lenderDashboard}?message=${encodeURIComponent(
        "Licensed lenders provide a licence number at signup — no form needed."
      )}`
    );
  }

  const defaults: LenderVerificationValues = {
    legal_name: profile?.legal_name ?? "",
    business_name: profile?.business_name ?? "",
    business_email: profile?.business_email ?? "",
    phone: profile?.phone ?? "",
    website_or_social: profile?.website_or_social ?? "",
    business_address_or_service_area: profile?.business_address_or_service_area ?? "",
    operating_provinces: profile?.operating_provinces ?? [],
    incorporated_over_1_year: profile?.incorporated_over_1_year ?? false,
    accepts_no_upfront_fee_rule: profile?.accepts_no_upfront_fee_rule ?? false,
    accepts_interest_compliance: profile?.accepts_interest_compliance ?? false,
    accepts_platform_rules: profile?.accepts_platform_rules ?? false,
  };

  const isVerified = profile?.verification_status === "verified";

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.lenderDashboard}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Lender details</h1>
        <p className="mt-1 text-sm text-slate-600">
          Provide your business details and confirmations. An admin reviews account setup
          — it isn&apos;t automatic.
        </p>

        {isVerified && (
          <div className="mt-6 rounded-xl border border-verified-500/30 bg-verified-100/50 px-4 py-3">
            <Badge tone="verified">
              <Icon name="badge-check" className="h-3.5 w-3.5" />
              Active
            </Badge>
            <p className="mt-2 text-sm text-slate-700">
              Your account is active. You can still update your details below; significant
              changes may be re-reviewed.
            </p>
          </div>
        )}

        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        <Card className="mt-6">
          <CardContent>
            <LenderVerificationForm
              action={submitLenderVerificationAction}
              defaultValues={defaults}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
