import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { LoanRequestForm, type LoanRequestFormValues } from "@/components/forms";
import { updateLoanRequestAction } from "@/app/(borrower)/borrower/actions";
import { createClient } from "@/lib/supabase-server";
import { getBorrowerProfileId } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "Edit loan request" };

type LoanRequestRow = Database["public"]["Tables"]["loan_requests"]["Row"];

export default async function EditRequestPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const borrowerId = await getBorrowerProfileId();
  if (!borrowerId) redirect(ROUTES.borrowerMyRequests);

  const supabase = createClient();
  const { data } = await supabase
    .from("loan_requests")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const request = data as LoanRequestRow | null;

  // Not found, not owned, or admin-removed -> back to the list with a message.
  if (!request || request.borrower_id !== borrowerId) {
    redirect(`${ROUTES.borrowerMyRequests}?error=${encodeURIComponent("Request not found.")}`);
  }
  if (request.status === "removed_by_admin") {
    redirect(
      `${ROUTES.borrowerMyRequests}?error=${encodeURIComponent(
        "This request was removed by an admin and can't be edited."
      )}`
    );
  }

  const defaults: LoanRequestFormValues = {
    loan_category: request.loan_category,
    province: request.province,
    city: request.city,
    amount_range: request.amount_range,
    purpose_category: request.purpose_category,
    secured_status: request.secured_status,
    credit_score_range: request.credit_score_range,
    income_range: request.income_range,
    employment_type: request.employment_type,
    loan_term_range: request.loan_term_range,
    expected_interest_range: request.expected_interest_range,
    borrower_note: request.borrower_note,
  };

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

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Edit loan request</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update the details below. Your contact information is never part of a request.
        </p>

        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        <Card className="mt-6">
          <CardContent>
            <LoanRequestForm
              action={updateLoanRequestAction}
              submitLabel="Save changes"
              requestId={request.id}
              defaultValues={defaults}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
