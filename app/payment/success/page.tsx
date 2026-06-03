import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, PAYMENT_FEE_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = { title: "Payment received" };

/**
 * Stripe success landing. IMPORTANT: this page does NOT open the conversation —
 * the signed webhook (mark_contact_request_paid) is the authoritative step. Here
 * we just read the request's current status and guide the borrower:
 *   - already paid + conversation open  -> link into the thread
 *   - still processing (webhook not in yet) -> reassure + link to messages
 * We never reveal any lender contact info.
 */
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?: { request_id?: string; session_id?: string; kind?: string; credits?: string };
}) {
  // Credit-pack purchase confirmation (the webhook tops up the wallet).
  if (searchParams?.kind === "credits") {
    const credits = searchParams?.credits ?? "";
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-verified-100 text-verified-700">
            <Icon name="check" className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Payment received</h1>
          <Card className="mt-6 text-left">
            <CardContent className="space-y-3 py-6">
              <p className="text-sm text-slate-700">
                Thanks — we&apos;re adding{credits ? ` ${credits}` : ""} credits to your
                account. They usually appear within a few seconds. You can spend them to
                contact borrowers.
              </p>
              <Link
                href={ROUTES.credits}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
              >
                View balance
              </Link>
              <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
                {PAYMENT_FEE_DISCLAIMER}
              </p>
            </CardContent>
          </Card>
          <Link
            href={ROUTES.lenderDashboard}
            className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to dashboard
          </Link>
        </div>
      </Container>
    );
  }

  const requestId = searchParams?.request_id ?? "";
  const supabase = createClient();

  let conversationId: string | null = null;
  let paid = false;

  if (requestId) {
    const { data: cr } = await supabase
      .from("contact_requests")
      .select("id, status, payment_status")
      .eq("id", requestId)
      .maybeSingle();
    const row = cr as { status: string; payment_status: string } | null;
    paid = row?.payment_status === "paid" && row?.status === "approved";

    if (paid) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("contact_request_id", requestId)
        .maybeSingle();
      conversationId = (conv as { id: string } | null)?.id ?? null;
    }
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-verified-100 text-verified-700">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Payment received</h1>

        <Card className="mt-6 text-left">
          <CardContent className="space-y-3 py-6">
            {paid ? (
              <>
                <p className="text-sm text-slate-700">
                  Thanks — your payment is confirmed and your conversation is open.
                </p>
                {conversationId ? (
                  <Link
                    href={`${ROUTES.messages}/${conversationId}`}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Open the conversation
                  </Link>
                ) : (
                  <Link
                    href={ROUTES.messages}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Go to messages
                  </Link>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-700">
                  Thanks — we&apos;re confirming your payment with our processor. This usually
                  takes a few seconds. Your conversation will appear in Messages as soon as
                  it&apos;s confirmed.
                </p>
                <Link
                  href={ROUTES.messages}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Go to messages
                </Link>
              </>
            )}
            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              {PAYMENT_FEE_DISCLAIMER}
            </p>
          </CardContent>
        </Card>

        <Link
          href={ROUTES.borrowerContactRequests}
          className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to contact requests
        </Link>
      </div>
    </Container>
  );
}
