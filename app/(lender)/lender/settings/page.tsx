import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Icon } from "@/components/ui";
import { updateLenderSettingsAction } from "@/app/(lender)/lender/actions";
import { getCurrentProfile, getLenderProfile } from "@/lib/auth";
import { lenderTypeRequiresLicence } from "@/lib/licence-check";
import { PROVINCES, ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Lender settings" };

export default async function LenderSettingsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const profile = await getCurrentProfile();
  const lender = await getLenderProfile();
  const selected = new Set(lender?.operating_provinces ?? []);
  const isLicensed = lenderTypeRequiresLicence(lender?.lender_type ?? null);

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

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your public business details. Your contact info (email, phone) stays
          private and is shared only through an approved conversation.
        </p>

        {searchParams?.message && (
          <div className="mt-6 rounded-xl border border-verified-500/30 bg-verified-100/50 px-3 py-2 text-sm text-verified-700">
            {searchParams.message}
          </div>
        )}
        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        {/* Private account info (read-only) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon name="lock" className="h-4 w-4 text-slate-500" />
              Private account info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Account email</span>
              <span className="text-slate-900">{profile?.email || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Business email</span>
              <span className="text-slate-900">{lender?.business_email || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Phone</span>
              <span className="text-slate-900">{lender?.phone || "—"}</span>
            </div>
            <p className="pt-1 text-xs text-slate-500">
              {isLicensed
                ? "Your licence number is shown on your listings as self-reported. Update it below if it has changed."
                : "To update your business details, use the lender details page."}
            </p>
          </CardContent>
        </Card>

        {/* Editable display details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Business display details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateLenderSettingsAction} className="space-y-4">
              <Input
                id="business_name"
                name="business_name"
                label="Business name *"
                required
                defaultValue={lender?.business_name ?? ""}
              />
              <Input
                id="website_or_social"
                name="website_or_social"
                label="Website or social profile"
                defaultValue={lender?.website_or_social ?? ""}
                placeholder="https://"
              />
              <Input
                id="business_address_or_service_area"
                name="business_address_or_service_area"
                label="Service area"
                defaultValue={lender?.business_address_or_service_area ?? ""}
                placeholder="e.g. Greater Toronto Area"
              />
              {isLicensed && (
                <Input
                  id="licence_number"
                  name="licence_number"
                  label="Licence / registration number"
                  defaultValue={lender?.licence_number ?? ""}
                  placeholder="Your regulator licence or registration number"
                />
              )}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Operating provinces</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROVINCES.map((p) => (
                    <label
                      key={p.value}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="operating_provinces"
                        value={p.value}
                        defaultChecked={selected.has(p.value)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
