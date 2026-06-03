import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { startCreditPurchaseAction } from "@/app/credit-actions";
import { createClient } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";
import {
  ROUTES,
  CREDIT_PACKS,
  CONTACT_CREDIT_PRICING,
  CREDITS_FEE_DISCLAIMER,
  APP_NAME,
} from "@/lib/constants";

// Not linked from global nav — reachable only via "Buy credits" actions.
export const metadata: Metadata = {
  title: "Buy credits",
  robots: { index: false, follow: false },
};

function dollars(cents: number): string {
  return "$" + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

export default async function CreditsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const user = await getCurrentUser();

  // Show the signed-in user's balance (RLS limits the wallet to the owner).
  let balance: number | null = null;
  if (user) {
    const supabase = createClient();
    const { data } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    balance = (data as { balance: number } | null)?.balance ?? 0;
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Buy credits
        </h1>
        <p className="mt-1 text-base text-slate-600">
          Lenders spend credits to contact a borrower. Buy a pack below, then spend
          credits as you connect. Borrowers always post and connect for free.
        </p>

        {balance !== null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Icon name="spark" className="h-4 w-4 text-verified-700" />
            Your balance: <span className="font-semibold text-slate-900">{balance} credits</span>
          </div>
        )}

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

        {/* Credit packs */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Credit packs
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CREDIT_PACKS.map((pack) => (
            <Card key={pack.key}>
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{pack.credits} credits</p>
                  <p className="text-sm text-slate-500">{dollars(pack.amountCents)}</p>
                </div>
                {user ? (
                  <form action={startCreditPurchaseAction}>
                    <input type="hidden" name="pack_key" value={pack.key} />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      Buy
                    </button>
                  </form>
                ) : (
                  <Link
                    href={ROUTES.login}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-300 px-5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Sign in to buy
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Per-category contact costs (in credits) */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contact cost by loan category
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          When you contact a borrower, the credit cost depends on the loan category.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CONTACT_CREDIT_PRICING.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name="tag" className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700">{row.label}</span>
              </div>
              <Badge tone="neutral">{row.credits} credits</Badge>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500">
              {CREDITS_FEE_DISCLAIMER} {APP_NAME} is an introduction platform; credits do not
              purchase a loan, an offer, or a guarantee of any kind.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
