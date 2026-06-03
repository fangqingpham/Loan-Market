import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, LENDER_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { Database, LenderVerificationStatus } from "@/types/database";

export const metadata: Metadata = { title: "Admin · Lenders" };

type LenderRow = Database["public"]["Tables"]["lender_profiles"]["Row"];

const lenderTypeLabel = Object.fromEntries(LENDER_TYPES.map((t) => [t.value, t.label]));

const STATUS_LABEL: Record<LenderVerificationStatus, string> = {
  pending_verification: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

function tone(status: LenderVerificationStatus): "verified" | "warning" | "neutral" {
  if (status === "verified") return "verified";
  if (status === "pending_verification") return "warning";
  return "neutral";
}

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending_verification", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const VALID_STATUSES: LenderVerificationStatus[] = [
  "pending_verification",
  "verified",
  "rejected",
  "suspended",
];

export default async function AdminLendersPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const active = searchParams?.status ?? "";
  const supabase = createClient();

  let query = supabase
    .from("lender_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (active && VALID_STATUSES.includes(active as LenderVerificationStatus)) {
    query = query.eq("verification_status", active);
  }

  const { data } = await query;
  const lenders = (data as LenderRow[] | null) ?? [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={ROUTES.admin}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
            Admin
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Lender verification</h1>
          <p className="mt-1 text-sm text-slate-600">{lenders.length} lender(s) shown.</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = f.value === active;
          const href = f.value
            ? `${ROUTES.adminLenders}?status=${f.value}`
            : ROUTES.adminLenders;
          return (
            <Link
              key={f.label}
              href={href}
              className={
                isActive
                  ? "rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* List */}
      {lenders.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="py-12 text-center text-sm text-slate-600">
            No lenders match this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3">
          {lenders.map((l) => (
            <Link key={l.id} href={`${ROUTES.adminLenders}/${l.id}`} className="block">
              <Card className="transition-colors hover:border-brand-300">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {l.business_name || l.legal_name || "Unnamed lender"}
                      </h3>
                      <Badge tone={tone(l.verification_status)}>
                        {STATUS_LABEL[l.verification_status]}
                      </Badge>
                      <Badge tone="neutral">
                        {l.is_private_lender
                          ? "Private"
                          : lenderTypeLabel[l.lender_type ?? ""] ?? "Lender"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Updated {formatDate(l.updated_at)} · Joined {formatDate(l.created_at)}
                    </p>
                  </div>
                  <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
