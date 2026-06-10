import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Icon, FlashModal, Pagination } from "@/components/ui";
import { PublicProductCard, type ProductCardData } from "@/components/cards";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase-server";
import { getCurrentUserRole } from "@/lib/auth";
import { APP_NAME, ROUTES, SHOW_DEMO_CARDS_ALWAYS } from "@/lib/constants";
import type { ContactRequestStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Loan products",
  description:
    "Browse loan products from trusted lenders/brokers. Lender/broker contact details stay private — connecting opens an in-platform conversation only.",
};

const PAGE_SIZE = 20;
const FEATURED_COUNT = 10;

/**
 * Board ordering for the public products page:
 *  - PAGE 1 shows the first 20 listings by post date (oldest first) — the
 *    established/founding listings — and the first 10 of those are flagged
 *    "Featured".
 *  - FROM PAGE 2 onward, every remaining (newer) listing is shown latest-first.
 *
 * NOTE (ordering assumption): the spec said "show the first 20 posts on the
 * first page ... from the 2nd page, show the latest posts first", which only
 * differs from a plain newest-first board if page 1 is NOT newest-first — hence
 * page 1 = oldest 20. To instead make the WHOLE board simply latest-first
 * (page 1 = newest 20, newest 10 featured), replace this function body with:
 *   return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
 */
function arrangeProducts(items: ProductCardData[]): ProductCardData[] {
  const oldestFirst = [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const firstPage = oldestFirst.slice(0, PAGE_SIZE);
  const firstPageIds = new Set(firstPage.map((p) => p.id));
  const rest = items
    .filter((p) => !firstPageIds.has(p.id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [...firstPage, ...rest];
}

export default async function LoanProductsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string; page?: string };
}) {
  const role = await getCurrentUserRole(); // null when logged out
  const supabase = createClient();

  // Public, contact-free product cards (active listings only). The view is
  // granted to anon + authenticated and exposes no contact columns.
  const { data } = await supabase
    .from("lender_listing_cards" as never)
    .select(
      "id, product_title, loan_category, service_area, amount_range, term_range, rate_range, secured_status, product_description, important_conditions, created_at, business_name, is_private_lender, licence_number"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const products = (data as ProductCardData[] | null) ?? [];

  // Page 1 = first 20 posts (first 10 featured); page 2+ = latest first.
  const arranged = arrangeProducts(products);
  const totalPages = Math.max(1, Math.ceil(arranged.length / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, Number.parseInt(searchParams?.page ?? "1", 10) || 1),
    totalPages
  );
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageProducts = arranged.slice(pageStart, pageStart + PAGE_SIZE);

  // Pre-launch, demo cards always show. After launch, only when empty.
  // Toggle via SHOW_DEMO_CARDS_ALWAYS in lib/constants.ts. First page only so
  // they don't repeat beneath every paginated page.
  const showDemos = currentPage === 1 && (SHOW_DEMO_CARDS_ALWAYS || products.length === 0);

  // For a borrower, fetch their existing borrower→lender requests so each card
  // shows the right state (and doesn't offer a duplicate). RLS limits these to
  // the borrower's own rows.
  const statusByListing = new Map<string, ContactRequestStatus>();
  if (role === "borrower" && products.length > 0) {
    const { data: crData } = await supabase
      .from("contact_requests")
      .select("lender_listing_id, status, requested_at")
      .eq("direction", "borrower_to_lender")
      .order("requested_at", { ascending: false });
    type CrRow = {
      lender_listing_id: string | null;
      status: ContactRequestStatus;
      requested_at: string;
    };
    for (const r of (crData as CrRow[] | null) ?? []) {
      if (r.lender_listing_id && !statusByListing.has(r.lender_listing_id)) {
        statusByListing.set(r.lender_listing_id, r.status);
      }
    }
  }

  return (
    <>
      {/* Flash popup for request-flow messages (e.g. the daily contact limit). */}
      <FlashModal message={searchParams?.message} error={searchParams?.error} />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <Container className="py-10 sm:py-12">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Loan products
          </h1>
          <p className="mt-1 text-base text-slate-600">
            Products and services from trusted lenders/brokers across Canada. Lender/broker contact
            details stay private — you connect through an approved in-platform conversation.
          </p>
        </Container>
      </section>

      <Container className="py-8">
        {products.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5">
              {pageProducts.map((p, i) => (
                <PublicProductCard
                  key={p.id}
                  product={p}
                  viewerRole={role}
                  contactStatus={statusByListing.get(p.id) ?? null}
                  returnTo={ROUTES.loanProducts}
                  featured={pageStart + i < FEATURED_COUNT}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={ROUTES.loanProducts}
            />
          </>
        )}

        {showDemos && (
          <>
            <div className={`${products.length > 0 ? "mt-6" : ""} mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600`}>
              {products.length > 0
                ? "Example products shown below to illustrate the board while we grow. Real lender/broker products appear above."
                : "These are example products that show how the board looks. Real lender/broker products will appear here as trusted lenders/brokers post them."}
            </div>
            <div className="grid grid-cols-1 gap-5">
              {DEMO_PRODUCTS.map((p) => (
                <PublicProductCard key={p.id} product={p} viewerRole={role} demo />
              ))}
            </div>
          </>
        )}

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500">
              {APP_NAME} is an introduction platform. We do not lend, broker, approve,
              underwrite, recommend, or arrange loans. Lender/broker phone, email, and website are
              never displayed. Always do your own due diligence.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
