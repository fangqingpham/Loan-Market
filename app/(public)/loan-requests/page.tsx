import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Button, Card, CardContent, Badge, Icon } from "@/components/ui";
import { PublicLoanRequestCard, type PublicPreview, type LenderExtra } from "@/components/cards";
import { LoanRequestFilters } from "@/components/forms/LoanRequestFilters";
import { DEMO_LOAN_REQUESTS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase-server";
import { getLenderVerificationStatus, getCurrentUser } from "@/lib/auth";
import { APP_NAME, ROUTES, SHOW_DEMO_CARDS_ALWAYS } from "@/lib/constants";
import type { Database, ContactRequestStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Loan requests",
  description:
    "Browse active loan requests posted by borrowers. Signed-in lenders see expanded details and can request contact.",
};

type LoanRequestRow = Database["public"]["Tables"]["loan_requests"]["Row"];

/**
 * Fetch active loan requests.
 *
 * Privacy architecture:
 *  - The `loan_request_previews` VIEW is the base list for EVERYONE. The DB
 *    exposes it to anon+authenticated and it contains only safe public columns
 *    (no contact, no lender-only fields) plus the borrower's chosen
 *    `display_name` nickname. The view runs with owner rights, so it can read
 *    the RLS-protected borrower_profiles for that one safe column — a verified
 *    lender browsing the board cannot read borrower_profiles directly (RLS
 *    only allows that once they share a conversation), which is why the handle
 *    must come from the view for everyone.
 *  - Verified lenders ALSO read the `loan_requests` TABLE for the extra columns
 *    (credit, income, etc.), merged by id. RLS policy `lr_select` allows this
 *    only when `status = 'active'` AND `is_verified_lender()`.
 *  - Contact info is structurally impossible to leak: `loan_requests` has NO
 *    name/email/phone columns, and `display_name` is a self-chosen nickname,
 *    not the borrower's legal name (which lives in `profiles`, never queried).
 */
async function fetchRequests(
  isVerified: boolean,
  filters: { category?: string; province?: string; amount?: string; secured?: string }
) {
  const supabase = createClient();

  // Base list for everyone — the safe preview view (includes display_name).
  let previewQuery = supabase
    .from("loan_request_previews" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.category) previewQuery = previewQuery.eq("loan_category", filters.category);
  if (filters.province) previewQuery = previewQuery.eq("province", filters.province);
  if (filters.amount) previewQuery = previewQuery.eq("amount_range", filters.amount);
  if (filters.secured) previewQuery = previewQuery.eq("secured_status", filters.secured);

  const { data: previewData } = await previewQuery;
  const previews = (previewData as PublicPreview[] | null) ?? [];

  if (!isVerified || previews.length === 0) {
    return previews.map((p) => ({
      preview: p,
      extra: undefined as LenderExtra | undefined,
      contactStatus: null as ContactRequestStatus | null,
    }));
  }

  // Verified lender — pull the lender-only fields from the table and merge by id.
  const { data: extraData } = await supabase
    .from("loan_requests")
    .select(
      "id, credit_score_range, income_range, employment_type, expected_interest_range, borrower_note"
    )
    .eq("status", "active")
    .limit(100);

  type ExtraRow = Pick<
    LoanRequestRow,
    | "id"
    | "credit_score_range"
    | "income_range"
    | "employment_type"
    | "expected_interest_range"
    | "borrower_note"
  >;
  const extraRows = (extraData as ExtraRow[] | null) ?? [];
  const extraById = new Map(extraRows.map((r) => [r.id, r]));

  // The lender's own existing contact requests, so each card can show the right
  // state (and not offer a duplicate). RLS limits this to the lender's own rows.
  const { data: crData } = await supabase
    .from("contact_requests")
    .select("loan_request_id, status, requested_at")
    .eq("direction", "lender_to_borrower")
    .order("requested_at", { ascending: false });
  type CrRow = { loan_request_id: string | null; status: ContactRequestStatus; requested_at: string };
  const crRows = (crData as CrRow[] | null) ?? [];
  // Keep the most recent status per loan request (rows are already newest-first).
  const statusByLoanRequest = new Map<string, ContactRequestStatus>();
  for (const r of crRows) {
    if (r.loan_request_id && !statusByLoanRequest.has(r.loan_request_id)) {
      statusByLoanRequest.set(r.loan_request_id, r.status);
    }
  }

  return previews.map((p) => {
    const e = extraById.get(p.id);
    return {
      preview: p,
      extra: e
        ? ({
            credit_score_range: e.credit_score_range,
            income_range: e.income_range,
            employment_type: e.employment_type,
            expected_interest_range: e.expected_interest_range,
            borrower_note: e.borrower_note,
          } satisfies LenderExtra)
        : undefined,
      contactStatus: statusByLoanRequest.get(p.id) ?? null,
    };
  });
}

export default async function LoanRequestsPage({
  searchParams,
}: {
  searchParams?: {
    category?: string;
    province?: string;
    amount?: string;
    secured?: string;
  };
}) {
  const verificationStatus = await getLenderVerificationStatus();
  const isVerified = verificationStatus === "verified";
  // Reporting requires being signed in; show the Report control to any logged-in user.
  const signedIn = Boolean(await getCurrentUser());

  const filters = {
    category: searchParams?.category ?? "",
    province: searchParams?.province ?? "",
    amount: searchParams?.amount ?? "",
    secured: searchParams?.secured ?? "",
  };

  const results = await fetchRequests(isVerified, filters);
  const hasFilters = Object.values(filters).some(Boolean);
  // Pre-launch, demo cards always show (unless filtering). After launch, they
  // show only when there are no real results. Toggle via SHOW_DEMO_CARDS_ALWAYS.
  const showDemos = !hasFilters && (SHOW_DEMO_CARDS_ALWAYS || results.length === 0);

  return (
    <>
      {/* Header */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-10 sm:py-12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Loan requests
              </h1>
              <p className="mt-1 text-base text-slate-600">
                Browse active loan requests from borrowers across Canada.
                {!isVerified &&
                  " Sign in as a lender to see expanded details."}
              </p>
            </div>
            {isVerified && (
              <Badge tone="verified" className="mt-1">
                <Icon name="badge-check" className="h-3.5 w-3.5" />
                Lender view
              </Badge>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-8">
        {/* Filters */}
        <Suspense fallback={null}>
          <LoanRequestFilters />
        </Suspense>

        {/* CTA for non-verified viewers */}
        {!isVerified && (
          <Card className="mt-6 border-brand-200 bg-brand-50">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
                  <Icon name="badge-check" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Sign in as a lender to view more details and request contact.
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Signed-in lenders see credit score range, income range, employment
                    type, interest expectations, and borrower notes.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={ROUTES.login}>
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href={ROUTES.signupLender}>
                  <Button size="sm">Join as a lender</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {results.map((r) => (
              <PublicLoanRequestCard
                key={r.preview.id}
                preview={r.preview}
                extra={r.extra}
                canRequestContact={isVerified}
                contactStatus={r.contactStatus}
                reportReturnTo={signedIn ? ROUTES.loanRequests : undefined}
              />
            ))}
          </div>
        )}

        {/* No real results AND filtering — prompt to adjust filters */}
        {results.length === 0 && hasFilters && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Icon name="search" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  No active requests found
                </p>
                <p className="mt-1 text-sm text-slate-600">Try adjusting your filters.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo / example cards */}
        {showDemos && (
          <>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {results.length > 0
                ? "Example requests shown below to illustrate the board while we grow. Real borrower requests appear above."
                : "These are example requests that show how the board looks. Real borrower requests will appear here as borrowers post them."}
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {DEMO_LOAN_REQUESTS.map((p) => (
                <PublicLoanRequestCard key={p.id} preview={p} demo />
              ))}
            </div>
          </>
        )}

        {/* Board-level safety note */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500">
              {APP_NAME} is an introduction platform. We do not lend, broker,
              approve, underwrite, recommend, or arrange loans. Borrower contact
              information is never displayed on this board. Always do your own due
              diligence.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
