import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import {
  approveContactAction,
  rejectContactAction,
  cancelListingContactAction,
} from "@/app/(borrower)/borrower/contact-actions";
import { startListingPaymentAction } from "@/app/(borrower)/borrower/payment-actions";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, LENDER_TYPES, PAYMENT_FEE_DISCLAIMER } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ContactRequestStatus } from "@/types/database";

export const metadata: Metadata = { title: "Contact requests" };

const lenderTypeLabel = Object.fromEntries(LENDER_TYPES.map((t) => [t.value, t.label]));

const STATUS_PILL: Record<string, { label: string; tone: "verified" | "warning" | "neutral" }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "verified" },
  approved_pending_payment: { label: "Approved — payment needed", tone: "warning" },
  rejected: { label: "Declined", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

function dollars(cents: number): string {
  return "$" + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

type IncomingRow = {
  id: string;
  status: ContactRequestStatus;
  lender_id: string;
  loan_request_id: string | null;
  requested_at: string;
};

type SentRow = {
  id: string;
  status: ContactRequestStatus;
  lender_id: string;
  lender_listing_id: string | null;
  requested_at: string;
  payment_required: boolean;
  amount_cents: number;
};

type LenderDir = {
  id: string;
  business_name: string | null;
  lender_type: string | null;
  is_private_lender: boolean | null;
};

export default async function BorrowerContactRequestsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const supabase = createClient();

  // Requests addressed TO this borrower (lender → borrower). Approve/decline.
  const { data: inData } = await supabase
    .from("contact_requests")
    .select("id, status, lender_id, loan_request_id, requested_at")
    .eq("direction", "lender_to_borrower")
    .order("requested_at", { ascending: false });
  const incoming = (inData as IncomingRow[] | null) ?? [];

  // Requests this borrower SENT to lenders about a product (borrower → lender).
  const { data: sentData } = await supabase
    .from("contact_requests")
    .select("id, status, lender_id, lender_listing_id, requested_at, payment_required, amount_cents")
    .eq("direction", "borrower_to_lender")
    .order("requested_at", { ascending: false });
  const sent = (sentData as SentRow[] | null) ?? [];

  // Resolve safe lender display info (business name + type) for both lists.
  const lenderIds = Array.from(
    new Set([...incoming.map((r) => r.lender_id), ...sent.map((r) => r.lender_id)])
  );
  const lenderById = new Map<string, LenderDir>();
  if (lenderIds.length > 0) {
    const { data: dirData } = await supabase
      .from("lender_directory" as never)
      .select("id, business_name, lender_type, is_private_lender")
      .in("id", lenderIds);
    for (const l of (dirData as LenderDir[] | null) ?? []) lenderById.set(l.id, l);
  }

  const pending = incoming.filter((r) => r.status === "pending");
  const handled = incoming.filter((r) => r.status !== "pending");

  function lenderName(id: string): string {
    const l = lenderById.get(id);
    if (!l) return "A lender/broker";
    return l.business_name || (l.is_private_lender ? "Private lender" : "Lender/Broker");
  }
  function lenderKind(id: string): string {
    const l = lenderById.get(id);
    if (!l) return "Lender/Broker";
    return l.is_private_lender ? "Private lender" : lenderTypeLabel[l.lender_type ?? ""] ?? "Lender/Broker";
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.borrowerDashboard}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Contact requests</h1>
        <p className="mt-1 text-sm text-slate-600">
          Lenders and brokers who want to connect, and the product enquiries you&apos;ve sent.
          Approving opens a private message thread; contact details stay hidden until then.
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

        {/* Incoming (lender → borrower) */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Lenders/brokers requesting contact ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center text-sm text-slate-600">
              No pending requests right now.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 grid gap-3">
            {pending.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon name="handshake" className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {lenderName(r.lender_id)}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {lenderKind(r.lender_id)}
                          {r.loan_request_id
                            ? ` · Re: Request #${r.loan_request_id.slice(0, 8).toUpperCase()}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(r.requested_at)}</span>
                  </div>

                  <div className="flex gap-2">
                    <form action={approveContactAction}>
                      <input type="hidden" name="request_id" value={r.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-verified-600 px-4 text-sm font-medium text-white hover:bg-verified-700"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectContactAction}>
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
                    Your name and contact details stay hidden unless you approve.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sent (borrower → lender) */}
        {sent.length > 0 && (
          <>
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Product enquiries you&apos;ve sent
            </h2>
            <div className="mt-3 grid gap-3">
              {sent.map((r) => {
                const pill = STATUS_PILL[r.status] ?? { label: r.status, tone: "neutral" as const };
                const needsPayment = r.status === "approved_pending_payment" && r.payment_required;
                return (
                  <Card key={r.id}>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {lenderName(r.lender_id)}
                          </h3>
                          <p className="text-xs text-slate-500">Sent {formatDate(r.requested_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={pill.tone}>{pill.label}</Badge>
                          {r.status === "pending" && (
                            <form action={cancelListingContactAction}>
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
                      </div>

                      {/* Approved — borrower pays to open messaging */}
                      {needsPayment && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-sm font-medium text-amber-900">
                            The lender/broker approved your enquiry. Pay {dollars(r.amount_cents)} to open
                            messaging.
                          </p>
                          <p className="mt-1 text-xs text-amber-800">{PAYMENT_FEE_DISCLAIMER}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <form action={startListingPaymentAction}>
                              <input type="hidden" name="request_id" value={r.id} />
                              <button
                                type="submit"
                                className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
                              >
                                Pay {dollars(r.amount_cents)} to open messaging
                              </button>
                            </form>
                            <form action={cancelListingContactAction}>
                              <input type="hidden" name="request_id" value={r.id} />
                              <button
                                type="submit"
                                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* History of handled incoming */}
        {handled.length > 0 && (
          <>
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
              History
            </h2>
            <div className="mt-3 grid gap-2">
              {handled.map((r) => {
                const pill = STATUS_PILL[r.status] ?? { label: r.status, tone: "neutral" as const };
                return (
                  <Card key={r.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{lenderName(r.lender_id)}</p>
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
      </div>
    </Container>
  );
}
