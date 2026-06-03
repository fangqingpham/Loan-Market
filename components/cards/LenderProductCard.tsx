import Link from "next/link";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { delistProductAction, relistProductAction } from "@/app/(lender)/lender/product-actions";
import { LOAN_CATEGORIES, LISTING_STATUS_LABELS, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ListingStatus } from "@/types/database";

const categoryLabel = Object.fromEntries(LOAN_CATEGORIES.map((c) => [c.value, c.label]));

export type LenderProductRow = {
  id: string;
  product_title: string;
  loan_category: string;
  service_area: string | null;
  amount_range: string | null;
  rate_range: string | null;
  status: ListingStatus;
  created_at: string;
};

function tone(status: ListingStatus): "verified" | "warning" | "neutral" {
  if (status === "active") return "verified";
  if (status === "delisted") return "warning";
  return "neutral";
}

export function LenderProductCard({ product }: { product: LenderProductRow }) {
  const isRemoved = product.status === "removed_by_admin";

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{product.product_title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {categoryLabel[product.loan_category] ?? product.loan_category} · Posted{" "}
              {formatDate(product.created_at)}
            </p>
          </div>
          <Badge tone={tone(product.status)}>{LISTING_STATUS_LABELS[product.status]}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.service_area && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {product.service_area}
            </span>
          )}
          {product.amount_range && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {product.amount_range}
            </span>
          )}
          {product.rate_range && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {product.rate_range}
            </span>
          )}
        </div>

        {isRemoved ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            This product was removed by an admin.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            <Link
              href={`${ROUTES.lenderProducts}/${product.id}/edit`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </Link>
            {product.status === "active" ? (
              <form action={delistProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Delist
                </button>
              </form>
            ) : (
              <form action={relistProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Relist
                </button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
