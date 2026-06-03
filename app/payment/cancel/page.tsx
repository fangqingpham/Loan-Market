import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Payment cancelled" };

/**
 * Stripe cancel landing. No payment was taken and NO conversation was opened.
 * The request remains 'approved_pending_payment' until it's paid or its 24h
 * window expires, so the borrower can try again from contact requests.
 */
export default function PaymentCancelPage({
  searchParams,
}: {
  searchParams?: { request_id?: string };
}) {
  void searchParams;
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon name="arrow-right" className="h-7 w-7 rotate-180" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Payment cancelled</h1>

        <Card className="mt-6 text-left">
          <CardContent className="space-y-3 py-6">
            <p className="text-sm text-slate-700">
              No payment was taken and no conversation was opened. You can pay to open
              messaging any time before the request&apos;s window closes.
            </p>
            <Link
              href={ROUTES.borrowerContactRequests}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Back to contact requests
            </Link>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
