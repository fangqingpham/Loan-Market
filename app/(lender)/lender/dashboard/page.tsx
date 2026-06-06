import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Icon, type IconName } from "@/components/ui";
import { getCurrentProfile, getLenderProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, DAILY_FREE_CONTACTS_PER_SIDE, PRICING_VISIBLE, LICENSED_LENDER_LABEL } from "@/lib/constants";
import { lenderTypeRequiresLicence } from "@/lib/licence-check";
import type { LenderVerificationStatus, LicenceVerificationStatus } from "@/types/database";

export const metadata: Metadata = { title: "Lender dashboard" };

const STATUS_LABEL: Record<LenderVerificationStatus, string> = {
  pending_verification: "Pending review",
  verified: "Active",
  rejected: "Not approved",
  suspended: "Suspended",
};

function statusTone(status: LenderVerificationStatus): "verified" | "warning" | "neutral" {
  if (status === "verified") return "verified";
  if (status === "pending_verification") return "warning";
  return "neutral";
}

function statusMessage(status: LenderVerificationStatus): string {
  switch (status) {
    case "verified":
      return "Your account is active. You can browse full borrower requests, request contact, and post listings.";
    case "pending_verification":
      return "Your account is being set up. Until it's active, you can't view expanded borrower details or request contact.";
    case "rejected":
      return "Your account was not approved. Review your details and resubmit.";
    case "suspended":
      return "Your account is suspended, so marketplace features are turned off. Please contact support; you can still review your details.";
  }
}

/** True when a licensed lender's licence check failed and needs attention. */
function licenceNeedsAttention(s: LicenceVerificationStatus): boolean {
  return s === "suspended" || s === "not_found";
}

export default async function LenderDashboardPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const profile = await getCurrentProfile();
  const lender = await getLenderProfile();

  const status = lender?.verification_status ?? "pending_verification";
  const licenceStatus = lender?.licence_verification_status ?? "pending";
  const isVerified = status === "verified";
  const isPrivate = lender?.is_private_lender ?? false;
  const isLicensed = lenderTypeRequiresLicence(lender?.lender_type ?? null);
  const name = profile?.fullName || "there";

  const licenceFailed = isLicensed && licenceNeedsAttention(licenceStatus);

  // Live count of NEW contact requests this lender has STARTED today
  // (America/Toronto day) — the unit the daily anti-spam cap counts. RLS
  // restricts these rows to the lender's own requests.
  let sentToday = 0;
  let creditBalance = 0;
  if (isVerified && profile) {
    const supabase = createClient();
    const torontoDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayTor = torontoDay.format(new Date());
    const { data: crData } = await supabase
      .from("contact_requests")
      .select("requested_at")
      .eq("direction", "lender_to_borrower");
    type Row = { requested_at: string };
    for (const r of (crData as Row[] | null) ?? []) {
      if (torontoDay.format(new Date(r.requested_at)) === todayTor) sentToday += 1;
    }

    // Credit balance (RLS limits the wallet to the owner). Dormant while pricing
    // is hidden; the card below only renders when PRICING_VISIBLE is true.
    const { data: walletData } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", profile.userId)
      .maybeSingle();
    creditBalance = (walletData as { balance: number } | null)?.balance ?? 0;
  }

  const marketplaceActions: { icon: IconName; label: string; desc: string; href?: string }[] = [
    { icon: "search", label: "Browse borrower requests", desc: "See full borrower loan requests and request contact.", href: ROUTES.loanRequests },
    { icon: "document", label: "My listings", desc: "Create and manage your loan product listings.", href: ROUTES.lenderProducts },
    { icon: "handshake", label: "Contact requests", desc: "Track your contact requests and approvals.", href: ROUTES.lenderContactRequests },
    { icon: "message", label: "Messages", desc: "Conversations with borrowers who approved you.", href: ROUTES.messages },
  ];

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">Account status:</span>
            <Badge tone={statusTone(status)}>
              {status === "verified" && <Icon name="badge-check" className="h-3.5 w-3.5" />}
              {STATUS_LABEL[status]}
            </Badge>
            <Badge tone="neutral">{isPrivate ? "Private lender" : LICENSED_LENDER_LABEL}</Badge>
          </div>
        </div>
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

      {/* Licence-failure banner for licensed lenders (suspended / not found) */}
      {licenceFailed && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  There&apos;s a problem with your licence details.
                </p>
                <p className="mt-0.5 text-sm text-red-700">
                  {lender?.licence_check_message ??
                    "Please update your licence details to be able to post listings or contact borrowers."}
                </p>
              </div>
            </div>
            <Link href={ROUTES.lenderSettings} className="shrink-0">
              <Button size="sm">Update licence</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Status explanation + contextual CTA */}
      <Card className="mt-6">
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">{statusMessage(status)}</p>

          {/* Licensed lender, setup still pending — informational */}
          {isLicensed && !isVerified && !licenceFailed && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Your account is being set up from the licence number you provided at signup.
              No form is needed.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {/* Only PRIVATE lenders use the verification form. */}
            {isPrivate && (status === "pending_verification" || status === "rejected") && (
              <Link href={ROUTES.lenderVerification}>
                <Button size="sm">
                  {status === "rejected" ? "Update & resubmit" : "Complete account setup"}
                </Button>
              </Link>
            )}
            {isPrivate && status === "verified" && (
              <Link href={ROUTES.lenderVerification}>
                <Button size="sm" variant="outline">Update account details</Button>
              </Link>
            )}
            <Link href={ROUTES.lenderSettings}>
              <Button size="sm" variant="ghost">Settings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Daily free-contacts usage */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="spark" className="h-4 w-4 text-verified-700" />
            New contacts today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {isVerified ? `${sentToday} / ${DAILY_FREE_CONTACTS_PER_SIDE}` : "—"}
            </span>
            <span className="text-sm text-slate-500">used today</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isVerified
              ? "To keep the marketplace free of spam, you can start up to a set number of new contact requests each day. The limit resets tomorrow; conversations already open are never affected."
              : "Available once your account is active."}
          </p>
        </CardContent>
      </Card>

      {/* Credits wallet (verified lenders) — hidden while pricing is hidden. */}
      {isVerified && PRICING_VISIBLE && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon name="tag" className="h-4 w-4 text-brand-600" />
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{creditBalance}</span>
                  <span className="text-sm text-slate-500">credits available</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Spend credits to contact borrowers. Cost depends on the loan category.
                </p>
              </div>
              <Link href={ROUTES.credits}>
                <Button size="sm">Buy credits</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marketplace actions (verified only) */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Marketplace
          </h2>
          {!isVerified && <Badge tone="neutral">Locked until active</Badge>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {marketplaceActions.map((a) => (
            <Card key={a.label} className={isVerified ? undefined : "opacity-70"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={a.icon} className="h-5 w-5" />
                  </span>
                  {a.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">{a.desc}</p>
                {isVerified && a.href ? (
                  <Link href={a.href}>
                    <Button variant="outline" size="sm">Open</Button>
                  </Link>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled>
                    {isVerified ? "Coming soon" : "Active to unlock"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
