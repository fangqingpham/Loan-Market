import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, REPORT_REASONS } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ReportStatus } from "@/types/database";

export const metadata: Metadata = { title: "Reports" };

const reasonLabel = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));

const STATUS_TONE: Record<ReportStatus, "warning" | "verified" | "neutral"> = {
  open: "warning",
  reviewing: "verified",
  closed: "neutral",
};

type ReportRow = {
  id: string;
  reason: string;
  status: ReportStatus;
  related_loan_request_id: string | null;
  related_lender_listing_id: string | null;
  related_conversation_id: string | null;
  created_at: string;
};

const FILTERS: { value: string; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

function targetKind(r: ReportRow): string {
  if (r.related_loan_request_id) return "Loan request";
  if (r.related_lender_listing_id) return "Lender product";
  if (r.related_conversation_id) return "Message thread";
  return "User";
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const filter = searchParams?.status ?? "open";
  const supabase = createClient();

  // Admin reads all reports (rep_select allows admin). Filter by status unless "all".
  let query = supabase
    .from("reports")
    .select(
      "id, reason, status, related_loan_request_id, related_lender_listing_id, related_conversation_id, created_at"
    )
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);

  const { data } = await query;
  const reports = (data as ReportRow[] | null) ?? [];

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={ROUTES.admin}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          Admin dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-600">
          User reports of loan requests, products, and message threads.
        </p>

        {/* Status filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Link
                key={f.value}
                href={`${ROUTES.adminReports}?status=${f.value}`}
                className={
                  active
                    ? "inline-flex h-9 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white"
                    : "inline-flex h-9 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {reports.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-12 text-center text-sm text-slate-600">
              No {filter !== "all" ? filter : ""} reports.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-3">
            {reports.map((r) => (
              <Link key={r.id} href={`${ROUTES.adminReports}/${r.id}`} className="block">
                <Card className="transition-colors hover:border-brand-300">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {reasonLabel[r.reason] ?? r.reason}
                        </h3>
                        <Badge tone="neutral">{targetKind(r)}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Reported {formatDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                      <Icon name="arrow-right" className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
