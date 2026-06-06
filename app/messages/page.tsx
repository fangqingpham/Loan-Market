import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Badge, Icon } from "@/components/ui";
import { createClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ConversationStatus } from "@/types/database";

export const metadata: Metadata = { title: "Messages" };

type ConvRow = {
  id: string;
  borrower_id: string;
  lender_id: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
};

export default async function MessagesListPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const role = profile.role;

  const supabase = createClient();

  // RLS conv_select restricts these to conversations where the current user is
  // a participant (or admin), so we never see anyone else's threads.
  const { data: convData } = await supabase
    .from("conversations")
    .select("id, borrower_id, lender_id, status, created_at, updated_at")
    .order("updated_at", { ascending: false });
  const conversations = (convData as ConvRow[] | null) ?? [];

  // Resolve the other party's display name. A borrower sees the lender's safe
  // business name (lender_directory); a lender sees the borrower's chosen
  // nickname (borrower_profiles, readable because they share a conversation).
  const lenderNameById = new Map<string, string>();
  const borrowerNameById = new Map<string, string>();

  if (conversations.length > 0 && (role === "borrower" || role === "admin")) {
    const lenderIds = Array.from(new Set(conversations.map((c) => c.lender_id)));
    const { data } = await supabase
      .from("lender_directory" as never)
      .select("id, business_name")
      .in("id", lenderIds);
    for (const l of (data as { id: string; business_name: string | null }[] | null) ?? []) {
      lenderNameById.set(l.id, l.business_name || "Lender/Broker");
    }
  }
  if (conversations.length > 0 && (role === "lender" || role === "admin")) {
    const borrowerIds = Array.from(new Set(conversations.map((c) => c.borrower_id)));
    const { data } = await supabase
      .from("borrower_profiles")
      .select("id, display_name")
      .in("id", borrowerIds);
    for (const b of (data as { id: string; display_name: string | null }[] | null) ?? []) {
      borrowerNameById.set(b.id, b.display_name?.trim() || "Anonymous borrower");
    }
  }

  function otherParty(c: ConvRow): string {
    if (role === "borrower") return lenderNameById.get(c.lender_id) ?? "Lender/Broker";
    if (role === "lender") return borrowerNameById.get(c.borrower_id) ?? "Anonymous borrower";
    // admin
    return `${borrowerNameById.get(c.borrower_id) ?? "Borrower"} ↔ ${lenderNameById.get(c.lender_id) ?? "Lender/Broker"}`;
  }

  const dashHref =
    role === "borrower"
      ? ROUTES.borrowerDashboard
      : role === "lender"
        ? ROUTES.lenderDashboard
        : ROUTES.admin;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={dashHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Conversations open only after a borrower approves a lender/broker&apos;s contact
          request.
        </p>

        {conversations.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Icon name="handshake" className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-slate-900">No conversations yet</p>
              <p className="mt-1 text-sm text-slate-600">
                {role === "lender"
                  ? "Once a borrower approves one of your contact requests, your conversation will appear here."
                  : role === "borrower"
                    ? "When you approve a lender/broker's contact request, your conversation will appear here."
                    : "Approved contact requests open conversations, which appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-3">
            {conversations.map((c) => (
              <Link key={c.id} href={`${ROUTES.messages}/${c.id}`} className="block">
                <Card className="transition-colors hover:border-brand-300">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon name="user" className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{otherParty(c)}</h3>
                        <p className="text-xs text-slate-500">
                          Opened {formatDate(c.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === "closed" && <Badge tone="neutral">Closed</Badge>}
                      <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
