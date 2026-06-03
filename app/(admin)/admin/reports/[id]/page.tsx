import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Badge, Icon } from "@/components/ui";
import {
  setReportStatusAction,
  addReportNoteAction,
  suspendReportedUserAction,
  removeReportedContentAction,
} from "@/app/(admin)/admin/reports/actions";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, REPORT_REASONS } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ReportStatus } from "@/types/database";

export const metadata: Metadata = { title: "Report detail" };

const reasonLabel = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));

const STATUS_TONE: Record<ReportStatus, "warning" | "verified" | "neutral"> = {
  open: "warning",
  reviewing: "verified",
  closed: "neutral",
};

type ReportRow = {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  related_conversation_id: string | null;
  related_loan_request_id: string | null;
  related_lender_listing_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
};

type ProfileLite = {
  user_id: string;
  role: string;
  full_name: string | null;
  email: string | null;
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string; error?: string };
}) {
  const supabase = createClient();

  const { data } = await supabase
    .from("reports")
    .select(
      "id, reporter_user_id, reported_user_id, related_conversation_id, related_loan_request_id, related_lender_listing_id, reason, description, status, admin_notes, created_at"
    )
    .eq("id", params.id)
    .maybeSingle();
  const report = data as ReportRow | null;

  if (!report) {
    redirect(`${ROUTES.adminReports}?status=all`);
  }

  // Admins can read profiles (admin_all_profiles RLS) to identify both parties.
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("user_id, role, full_name, email")
    .in("user_id", [report.reporter_user_id, report.reported_user_id]);
  const profiles = (profilesData as ProfileLite[] | null) ?? [];
  const byId = new Map(profiles.map((p) => [p.user_id, p]));
  const reporter = byId.get(report.reporter_user_id);
  const reported = byId.get(report.reported_user_id);

  // Resolve a short label for the reported content (if any).
  let relatedLabel = "A user (message thread)";
  if (report.related_loan_request_id) {
    relatedLabel = `Loan request #${report.related_loan_request_id.slice(0, 8).toUpperCase()}`;
  } else if (report.related_lender_listing_id) {
    const { data: ll } = await supabase
      .from("lender_listings")
      .select("product_title")
      .eq("id", report.related_lender_listing_id)
      .maybeSingle();
    const listing = ll as { product_title: string } | null;
    relatedLabel = listing ? `Product: ${listing.product_title}` : "Lender product";
  }

  const hasRemovableContent =
    Boolean(report.related_loan_request_id) || Boolean(report.related_lender_listing_id);
  const reportedIsLender = reported?.role === "lender";

  function Field({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="text-sm text-slate-900">{value}</dd>
      </div>
    );
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.adminReports}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          All reports
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {reasonLabel[report.reason] ?? report.reason}
          </h1>
          <Badge tone={STATUS_TONE[report.status]}>{report.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">Reported {formatDate(report.created_at)}</p>

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

        {/* Report details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Reported target" value={relatedLabel} />
              <Field
                label="Reported user"
                value={
                  reported
                    ? `${reported.full_name || "—"} (${reported.role}${reported.email ? `, ${reported.email}` : ""})`
                    : "Unknown"
                }
              />
              <Field
                label="Reporter"
                value={
                  reporter
                    ? `${reporter.full_name || "—"} (${reporter.role}${reporter.email ? `, ${reporter.email}` : ""})`
                    : "Unknown"
                }
              />
            </dl>
            {report.description && (
              <div className="mt-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Reporter&apos;s note</dt>
                <dd className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {report.description}
                </dd>
              </div>
            )}
            {report.related_conversation_id && (
              <Link
                href={`${ROUTES.messages}/${report.related_conversation_id}`}
                className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline"
              >
                Open the reported conversation (admin view) →
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Status controls */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(["open", "reviewing", "closed"] as ReportStatus[]).map((s) => (
                <form action={setReportStatusAction} key={s}>
                  <input type="hidden" name="id" value={report.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    disabled={report.status === s}
                    className={
                      report.status === s
                        ? "inline-flex h-9 cursor-default items-center rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-400"
                        : "inline-flex h-9 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    }
                  >
                    Mark {s}
                  </button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin notes */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Admin notes</CardTitle>
          </CardHeader>
          <CardContent>
            {report.admin_notes && (
              <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap">
                {report.admin_notes}
              </p>
            )}
            <form action={addReportNoteAction} className="space-y-2">
              <input type="hidden" name="id" value={report.id} />
              <textarea
                name="admin_notes"
                required
                rows={3}
                placeholder="Add an internal note (replaces the saved note)…"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save note
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Enforcement actions */}
        <Card className="mt-4 border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700">Enforcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Suspend reported user (lenders only) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Suspend reported user</p>
                <p className="text-xs text-slate-500">
                  {reportedIsLender
                    ? "Sets the lender to suspended — removes them from the directory and boards."
                    : "Account suspension applies to lenders. For a borrower, remove their content instead."}
                </p>
              </div>
              <form action={suspendReportedUserAction}>
                <input type="hidden" name="id" value={report.id} />
                <input type="hidden" name="reported_user_id" value={report.reported_user_id} />
                <button
                  type="submit"
                  disabled={!reportedIsLender}
                  className={
                    reportedIsLender
                      ? "inline-flex h-9 items-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                      : "inline-flex h-9 cursor-not-allowed items-center rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-400"
                  }
                >
                  Suspend lender
                </button>
              </form>
            </div>

            {/* Remove related content */}
            {hasRemovableContent && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Remove reported content</p>
                  <p className="text-xs text-slate-500">
                    Sets the {report.related_loan_request_id ? "loan request" : "product"} to
                    removed; it disappears from public boards.
                  </p>
                </div>
                <form action={removeReportedContentAction}>
                  <input type="hidden" name="id" value={report.id} />
                  {report.related_loan_request_id && (
                    <input type="hidden" name="loan_request_id" value={report.related_loan_request_id} />
                  )}
                  {report.related_lender_listing_id && (
                    <input type="hidden" name="lender_listing_id" value={report.related_lender_listing_id} />
                  )}
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Remove content
                  </button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
