import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { LenderProductForm } from "@/components/forms";
import { createProductAction } from "@/app/(lender)/lender/product-actions";
import { getLenderProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Post a product" };

export default async function PostProductPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const lender = await getLenderProfile();

  // Only verified lenders can post products. Send everyone else back to the
  // dashboard (the DB also enforces this via ll_insert).
  if (!lender || lender.verification_status !== "verified") {
    redirect(
      `${ROUTES.lenderDashboard}?message=${encodeURIComponent(
        "Only verified lenders can post products."
      )}`
    );
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.lenderProducts}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          My products
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Post a product</h1>
        <p className="mt-1 text-sm text-slate-600">
          Describe a loan product or service. It appears on the public product board with
          your business name and verified badge — never your contact details.
        </p>

        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        <Card className="mt-6">
          <CardContent>
            <LenderProductForm action={createProductAction} submitLabel="Post product" />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
