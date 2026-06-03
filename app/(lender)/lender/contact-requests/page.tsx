import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import {
  cancelContactAction,
  approveListingContactAction,
  rejectListingContactAction,
} from "@/app/(lender)/lender/contact-actions";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, LENDER_FREE_CONTACTS_PER_WEEK } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ContactRequestStatus } from "@/types/database";

export const metadata: Metadata = { title: "My contact requests" };

const STATUS_PILL: Record<string, { label: string; tone: "verified" | "warning" | "neutral" }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "verified" },
  approved_pending_payment: { label: "Approved", tone: "verified" },
  rejected: { label: "Declined", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

type SentRow = {
  id: string;
  status: ContactRequestStatus;
  loan_request_id: string | null;
  requested_at: string;
  approved_at: string | null;
};

type IncomingRow = {
  id: string;
  status: ContactRequestStatus;
  lender_listing_id: string | null;
  requested_at: string;
};

type PreviewRow = { id: string; display_name: string | null };
type ListingRow = { id: string; product_title: string };

export default async function LenderContactRequestsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const supabase = createClient();

  // Requests this lender SENT to borrowers (lender→borrower).
  const { data: sentData } = await supabase
    .from("contact_requests")
    .select("id, status, loan_request_id, requested_at, approved_at")
    .eq("direction", "lender_to_borrower")
    .order("requested_at", { ascending: false });
  const sent = (sentData as SentRow[] | null) ?? [];

  // Requests borrowers sent to THIS lender about a product (borrower→lender).
  // RLS gives the lender these as the recipient.
  const { data: inData } = await supabase
    .from("contact_requests")
    .select("id, status, lender_listing_id, requested_at")
    .eq("direction", "borrower_to_lender")
    .order("requested_at", { ascending: false });
  const incoming = (inData as IncomingRow[] | null) ?? [];

  // Borrower nicknames for SENT requests (via the safe preview view).
  const loanIds = Array.from(
    new Set(sent.map((r) => r.loan_request_id).filter((x): x is string => Boolean(x)))
  );
  const previewById = new Map<string, PreviewRow>();
  if (loanIds.length > 0) {
    const { data: pvData } = await supabase
      .from("loan_request_previews" as never)
      .select("id, display_name")
      .in("id", loanIds);
    for (const p of (pvData as PreviewRow[] | null) ?? []) previewById.set(p.id, p);
  }

  // Product titles for INCOMING enquiries (the lender owns these listings).
  const listingIds = Array.from(
    new Set(incoming.map((r) => r.lender_listing_id).filter((x): x is string => Boolean(x)))
  );
  const listingById = new Map<string, ListingRow>();
  if (listingIds.length > 0) {
    const { data: llData } = await supabase
      .from("lender_listings")
      .select("id, product_title")
      .in("id", listingIds);
    for (const l of (llData as ListingRow[] | null) ?? []) listingById.set(l.id, l);
  }

  // Weekly approved-contacts used (counts lender→borrower approvals).
  const startOfWeek = new Date();
  const day = (startOfWeek.getUTCDay() + 6) % 7;
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - day);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  const approvedThisWeek = sent.filter(
    (r) => r.status === "approved" && r.approved_at && new Date(r.approved_at) >= startOfWeek
  ).length;

  const incomingPending = incoming.filter((r) => r.status === "pending");
  const incomingHandled = incoming.filter((r) => r.status !== "pending");

  function borrowerHandle(loanRequestId: string | null): string {
    if (!loanRequestId) return "Borrower";
    return previewById.get(loanRequestId)?.display_name?.trim() || "Anonymous borrower";
  }
  function productTitle(listingId: string | null): string {
    if (!listingId) return "your product";
    return listingById.get(listingId)?.product_title || "your product";
  }

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

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Contact requests</h1>

        {/* Weekly usage */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Icon name="spark" className="h-4 w-4 text-verified-700" />
          <span className="font-medium text-slate-900">
            {approvedThisWeek} / {LENDER_FREE_CONTACTS_PER_WEEK}
          </span>
          approved contacts used this week
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

        {/* ── Incoming product enquiries (borrower → lender) ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Product enquiries ({incomingPending.length})
        </h2>
        {incomingPending.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center text-sm text-slate-600">
              No pending product enquiries. When a borrower contacts you about a product,
              it appears here for you to approve or decline.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 grid gap-3">
            {incomingPending.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name="handshake" className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        A borrower is interested in {productTitle(r.lender_listing_id)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Received {formatDate(r.requested_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={approveListingContactAction}>
                      <input type="hidden" name="request_id" value={r.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-verified-600 px-4 text-sm font-medium text-white hover:bg-verified-700"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectListingContactAction}>
                      <input type="hidden" name="request_id" value={r.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                  <p className="text-xs text-slate-400">
                    The borrower&apos;s details stay hidden until you approve and a
                    conversation opens.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Requests you've sent (lender → borrower) ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Requests you&apos;ve sent
        </h2>
        {sent.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-slate-600">
                You haven&apos;t requested contact with any borrowers yet.
              </p>
              <Link
                href={ROUTES.loanRequests}
                className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline"
              >
                Browse loan requests →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 grid gap-3">
            {sent.map((r) => {
              const pill = STATUS_PILL[r.status] ?? { label: r.status, tone: "neutral" as const };
              return (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {borrowerHandle(r.loan_request_id)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {r.loan_request_id
                          ? `Request #${r.loan_request_id.slice(0, 8).toUpperCase()} · `
                          : ""}
                        Sent {formatDate(r.requested_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={pill.tone}>{pill.label}</Badge>
                      {r.status === "pending" && (
                        <form action={cancelContactAction}>
                          <input type="hidden" name="request_id" value={r.id} />
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* History of handled incoming enquiries */}
        {incomingHandled.length > 0 && (
          <>
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Past enquiries
            </h2>
            <div className="mt-3 grid gap-2">
              {incomingHandled.map((r) => {
                const pill = STATUS_PILL[r.status] ?? { label: r.status, tone: "neutral" as const };
                return (
                  <Card key={r.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {productTitle(r.lender_listing_id)}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(r.requested_at)}</p>
                      </div>
                      <Badge tone={pill.tone}>{pill.label}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-slate-400">
          Borrowers appear by nickname only, and only after approval. Names and contact
          details are never shown here.
        </p>
      </div>
    </Container>
  );
}
