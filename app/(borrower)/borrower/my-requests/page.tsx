import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Button, Icon } from "@/components/ui";
import { BorrowerRequestCard } from "@/components/cards";
import { createClient } from "@/lib/supabase-server";
import { getBorrowerProfileId } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "My loan requests" };

type LoanRequestRow = Database["public"]["Tables"]["loan_requests"]["Row"];

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const borrowerId = await getBorrowerProfileId();

  let requests: LoanRequestRow[] = [];
  if (borrowerId) {
    const supabase = createClient();
    const { data } = await supabase
      .from("loan_requests")
      .select("*")
      .eq("borrower_id", borrowerId)
      .order("created_at", { ascending: false });
    requests = (data as LoanRequestRow[] | null) ?? [];
  }

  const activeCount = requests.filter((r) => r.status === "active").length;

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My loan requests</h1>
          <p className="mt-1 text-sm text-slate-600">
            {requests.length === 0
              ? "You haven't posted any requests yet."
              : `${activeCount} active · ${requests.length} total. Your contact details are never shown on a request.`}
          </p>
        </div>
        <Link href={ROUTES.borrowerPostRequest}>
          <Button className="gap-1.5">
            <Icon name="document" className="h-4 w-4" />
            Post a request
          </Button>
        </Link>
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

      {requests.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon name="document" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">No requests yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Post a request for free to start hearing from verified lenders.
              </p>
            </div>
            <Link href={ROUTES.borrowerPostRequest}>
              <Button>Post your first request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4">
          {requests.map((request) => (
            <BorrowerRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </Container>
  );
}
