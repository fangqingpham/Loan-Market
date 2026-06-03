import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Icon } from "@/components/ui";
import { AdminLenderActions } from "@/components/dashboard";
import { addAdminNoteAction } from "@/app/(admin)/admin/lenders/actions";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, LENDER_TYPES, PROVINCES } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { Database, LenderVerificationStatus, LicenceVerificationStatus } from "@/types/database";

export const metadata: Metadata = { title: "Admin · Lender detail" };

type LenderRow = Database["public"]["Tables"]["lender_profiles"]["Row"];
type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];

const lenderTypeLabel = Object.fromEntries(LENDER_TYPES.map((t) => [t.value, t.label]));
const provinceLabel = Object.fromEntries(PROVINCES.map((p) => [p.value, p.label]));

const STATUS_LABEL: Record<LenderVerificationStatus, string> = {
  pending_verification: "Pending verification",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

const LICENCE_LABEL: Record<LicenceVerificationStatus, string> = {
  not_applicable: "Not applicable (private lender)",
  pending: "Pending check",
  verified: "Verified",
  not_found: "Not found",
  suspended: "Suspended",
};

function tone(status: LenderVerificationStatus): "verified" | "warning" | "neutral" {
  if (status === "verified") return "verified";
  if (status === "pending_verification") return "warning";
  return "neutral";
}

/** A labelled field row; renders a dash when empty. */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-900 sm:text-right">{value || "—"}</span>
    </div>
  );
}

function YesNo({ value }: { value: boolean | null }) {
  if (value === null) return <>—</>;
  return <>{value ? "Yes" : "No"}</>;
}

export default async function AdminLenderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string; error?: string };
}) {
  const supabase = createClient();

  const { data } = await supabase
    .from("lender_profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const lender = data as LenderRow | null;

  if (!lender) {
    redirect(`${ROUTES.adminLenders}?error=${encodeURIComponent("Lender not found.")}`);
  }

  // Admin notes for this lender (admin-only by RLS).
  const { data: noteData } = await supabase
    .from("admin_notes")
    .select("*")
    .eq("related_lender_profile_id", lender.id)
    .order("created_at", { ascending: false });
  const notes = (noteData as AdminNoteRow[] | null) ?? [];

  const provinces = (lender.operating_provinces ?? [])
    .map((p) => provinceLabel[p] ?? p)
    .join(", ");

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={ROUTES.adminLenders}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          All lenders
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {lender.business_name || lender.legal_name || "Unnamed lender"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={tone(lender.verification_status)}>
                {STATUS_LABEL[lender.verification_status]}
              </Badge>
              <Badge tone="neutral">
                {lender.is_private_lender
                  ? "Private lender"
                  : lenderTypeLabel[lender.lender_type ?? ""] ?? "Licensed lender"}
              </Badge>
            </div>
          </div>
        </div>

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

        {/* Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Verification actions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLenderActions lenderId={lender.id} status={lender.verification_status} />
            {lender.verification_notes && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-medium text-slate-700">Current note to lender:</span>{" "}
                {lender.verification_notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Business details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Business details</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <Field label="Legal name" value={lender.legal_name} />
            <Field label="Business name" value={lender.business_name} />
            <Field label="Business email" value={lender.business_email} />
            <Field label="Phone" value={lender.phone} />
            <Field label="Website / social" value={lender.website_or_social} />
            <Field label="Address / service area" value={lender.business_address_or_service_area} />
            <Field label="Lender type" value={lenderTypeLabel[lender.lender_type ?? ""] ?? lender.lender_type} />
            <Field label="Brokerage / company" value={lender.brokerage_or_company_name} />
            <Field label="Licence number" value={lender.licence_number} />
            <Field label="Licence check" value={LICENCE_LABEL[lender.licence_verification_status]} />
            <Field label="Operating provinces" value={provinces} />
          </CardContent>
        </Card>

        {/* Private lender declarations */}
        {lender.is_private_lender && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Private lender declarations</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <Field label="Incorporated over 1 year" value={<YesNo value={lender.incorporated_over_1_year} />} />
              <Field label="Accepts no-upfront-fee rule" value={<YesNo value={lender.accepts_no_upfront_fee_rule} />} />
              <Field label="Accepts interest-rate compliance" value={<YesNo value={lender.accepts_interest_compliance} />} />
              <Field label="Accepts platform rules" value={<YesNo value={lender.accepts_platform_rules} />} />
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Record</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <Field label="Created" value={formatDate(lender.created_at)} />
            <Field label="Last updated" value={formatDate(lender.updated_at)} />
          </CardContent>
        </Card>

        {/* Admin notes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Admin notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addAdminNoteAction} className="space-y-2">
              <input type="hidden" name="id" value={lender.id} />
              <input type="hidden" name="related_user_id" value={lender.user_id} />
              <textarea
                name="note"
                required
                rows={3}
                placeholder="Internal note (not shown to the lender)…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              />
              <Button type="submit" size="sm">Add note</Button>
            </form>

            {notes.length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">{n.note}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(n.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
