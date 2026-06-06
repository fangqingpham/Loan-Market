import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Icon, type IconName } from "@/components/ui";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentProfile } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Borrower dashboard" };

type Action = {
  icon: IconName;
  label: string;
  desc: string;
  href?: string;
  cta?: string;
};

const actions: Action[] = [
  {
    icon: "document",
    label: "Post a loan request",
    desc: "Create a new request. It's free and your contact details stay private.",
    href: ROUTES.borrowerPostRequest,
    cta: "Post a request",
  },
  {
    icon: "search",
    label: "My loan requests",
    desc: "View, edit, or delist the requests you've posted.",
    href: ROUTES.borrowerMyRequests,
    cta: "View my requests",
  },
  {
    icon: "handshake",
    label: "Contact requests",
    desc: "Approve or decline lenders/brokers who want to connect.",
    href: ROUTES.borrowerContactRequests,
    cta: "View contact requests",
  },
  {
    icon: "message",
    label: "Messages",
    desc: "Chat with lenders/brokers you've approved. Contact details stay private.",
    href: ROUTES.messages,
    cta: "Open messages",
  },
  {
    icon: "lock",
    label: "Settings",
    desc: "Manage your display details. Email and phone stay private.",
    href: ROUTES.borrowerSettings,
    cta: "Open settings",
  },
];

export default async function BorrowerDashboardPage() {
  const profile = await getCurrentProfile();
  const name = profile?.fullName || "there";

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your contact details stay private. You decide who gets to message you.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <Card key={a.label}>
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
              {a.href ? (
                <Link href={a.href}>
                  <Button variant="outline" size="sm">{a.cta}</Button>
                </Link>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Coming soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
