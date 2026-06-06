import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Button, Badge, Icon } from "@/components/ui";
import { LenderProductCard, type LenderProductRow } from "@/components/cards";
import { createClient } from "@/lib/supabase-server";
import { getLenderProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "My products" };

export default async function LenderProductsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const lender = await getLenderProfile();
  const isVerified = lender?.verification_status === "verified";

  const supabase = createClient();
  // RLS ll_select returns the lender's own listings (any status) plus active
  // ones; filtering by lender_id keeps this to their own products.
  const { data } = lender
    ? await supabase
        .from("lender_listings")
        .select("id, product_title, loan_category, service_area, amount_range, rate_range, status, created_at")
        .eq("lender_id", lender.id)
        .order("created_at", { ascending: false })
    : { data: null };
  const products = (data as LenderProductRow[] | null) ?? [];

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href={ROUTES.lenderDashboard}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
              Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">My products</h1>
            <p className="mt-1 text-sm text-slate-600">
              Product listings borrowers can browse. Listings never show your contact details.
            </p>
          </div>
          {isVerified && (
            <Link href={ROUTES.lenderPostProduct}>
              <Button size="sm">Post a product</Button>
            </Link>
          )}
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

        {!isVerified ? (
          <Card className="mt-6">
            <CardContent className="py-10 text-center">
              <Badge tone="warning">Account not active yet</Badge>
              <p className="mt-3 text-sm text-slate-600">
                You can post products once your account is active.
              </p>
              <Link
                href={ROUTES.lenderDashboard}
                className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline"
              >
                Back to dashboard →
              </Link>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-slate-600">You haven&apos;t posted any products yet.</p>
              <Link
                href={ROUTES.lenderPostProduct}
                className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline"
              >
                Post your first product →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-3">
            {products.map((p) => (
              <LenderProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
