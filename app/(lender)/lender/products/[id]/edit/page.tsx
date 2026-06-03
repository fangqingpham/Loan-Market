import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { LenderProductForm, type LenderProductFormValues } from "@/components/forms";
import { updateProductAction } from "@/app/(lender)/lender/product-actions";
import { createClient } from "@/lib/supabase-server";
import { getLenderProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "Edit product" };

type ListingRow = Database["public"]["Tables"]["lender_listings"]["Row"];

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const lender = await getLenderProfile();
  if (!lender) redirect(ROUTES.lenderDashboard);

  const supabase = createClient();
  const { data } = await supabase
    .from("lender_listings")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const product = data as ListingRow | null;

  // Not found or not owned → back to the list (RLS would also prevent edits).
  if (!product || product.lender_id !== lender.id) {
    redirect(`${ROUTES.lenderProducts}?error=${encodeURIComponent("Product not found.")}`);
  }
  if (product.status === "removed_by_admin") {
    redirect(
      `${ROUTES.lenderProducts}?error=${encodeURIComponent(
        "This product was removed by an admin and can't be edited."
      )}`
    );
  }

  const defaults: LenderProductFormValues = {
    product_title: product.product_title,
    loan_category: product.loan_category,
    service_area: product.service_area,
    amount_range: product.amount_range,
    term_range: product.term_range,
    rate_range: product.rate_range,
    secured_status: product.secured_status,
    product_description: product.product_description,
    important_conditions: product.important_conditions,
  };

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

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Edit product</h1>

        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        <Card className="mt-6">
          <CardContent>
            <LenderProductForm
              action={updateProductAction}
              submitLabel="Save changes"
              productId={product.id}
              defaultValues={defaults}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
