import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { ContactLenderButton } from "./ContactLenderButton";
import { LicenceBadge } from "./LicenceBadge";
import { ReportButton } from "@/components/safety";
import { LOAN_CATEGORIES, SECURED_STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ContactRequestStatus } from "@/types/database";

const categoryLabel = Object.fromEntries(LOAN_CATEGORIES.map((c) => [c.value, c.label]));
const securedLabel = Object.fromEntries(SECURED_STATUS_OPTIONS.map((s) => [s.value, s.label]));

/** Safe, contact-free fields exposed by the lender_listing_cards view. */
export type ProductCardData = {
  id: string;
  product_title: string;
  loan_category: string;
  service_area: string | null;
  amount_range: string | null;
  term_range: string | null;
  rate_range: string | null;
  secured_status: string | null;
  product_description: string | null;
  important_conditions: string | null;
  created_at: string;
  business_name: string | null;
  is_private_lender: boolean | null;
  licence_number: string | null;
};

function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
      <span className="text-slate-400">{label}:</span> {value}
    </span>
  );
}

export function PublicProductCard({
  product,
  viewerRole,
  contactStatus,
  returnTo,
  demo,
}: {
  product: ProductCardData;
  viewerRole: "borrower" | "lender" | "admin" | null;
  contactStatus?: ContactRequestStatus | null;
  returnTo?: string;
  /** Illustrative placeholder card — shows a sample (disabled) Contact button. */
  demo?: boolean;
}) {
  const company =
    product.business_name || (product.is_private_lender ? "Private lender" : "Lender/Broker");

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col space-y-3">
        {/* Header: title + company + licence (self-reported) */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{product.product_title}</h3>
              {demo && <Badge tone="neutral">Example</Badge>}
            </div>
            <div className="mt-1">
              <span className="text-base text-slate-600">{company}</span>
            </div>
            <div className="mt-2">
              <LicenceBadge licenceNumber={product.licence_number} />
            </div>
          </div>
          <span className="flex flex-col items-end gap-1">
            <span className="text-sm text-slate-500">{formatDate(product.created_at)}</span>
            {returnTo && !demo && <ReportButton lenderListingId={product.id} returnTo={returnTo} />}
          </span>
        </div>

        {/* Product facts */}
        <div className="flex flex-wrap gap-2">
          <Meta label="Category" value={categoryLabel[product.loan_category] ?? product.loan_category} />
          <Meta label="Area" value={product.service_area} />
          <Meta label="Amount" value={product.amount_range} />
          <Meta label="Term" value={product.term_range} />
          <Meta label="Rate" value={product.rate_range} />
          <Meta label="Secured" value={securedLabel[product.secured_status ?? ""] ?? null} />
        </div>

        {product.product_description && (
          <p className="text-base text-slate-700">{product.product_description}</p>
        )}
        {product.important_conditions && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Important conditions:</span>{" "}
            {product.important_conditions}
          </p>
        )}

        {/* Contact (no lender contact details are ever shown) */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-400">
            Contact details stay private. Connecting opens an in-platform conversation only.
          </p>
          {demo ? (
            <button
              type="button"
              disabled
              title="Example only"
              className="inline-flex h-9 shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-brand-600/50 px-4 text-sm font-medium text-white"
            >
              Contact
            </button>
          ) : (
            <ContactLenderButton
              listingId={product.id}
              viewerRole={viewerRole}
              existingStatus={contactStatus}
              returnTo={returnTo}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
