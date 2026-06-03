import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { LoanRequestForm } from "@/components/forms";
import { createLoanRequestAction } from "@/app/(borrower)/borrower/actions";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Post a loan request" };

export default function PostRequestPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.borrowerMyRequests}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          My requests
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Post a loan request</h1>
        <p className="mt-1 text-sm text-slate-600">
          It&apos;s free, and your contact details stay private. Only verified lenders can
          ask to connect, and you approve every connection.
        </p>

        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        <Card className="mt-6">
          <CardContent>
            <LoanRequestForm
              action={createLoanRequestAction}
              submitLabel="Post loan request"
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
