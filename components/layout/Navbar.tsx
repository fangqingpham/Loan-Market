"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { APP_NAME, ROUTES, PRICING_VISIBLE } from "@/lib/constants";
import { cn } from "@/lib/helpers";
import logo from "@/app/(public)/photo/LM.png";

const navLinks = [
  { href: ROUTES.howItWorks, label: "How it works" },
  { href: ROUTES.loanRequests, label: "Borrower requests" },
  { href: ROUTES.loanProducts, label: "Loan products" },
  { href: ROUTES.lenders, label: "Lenders/Brokers" },
  { href: ROUTES.safety, label: "Safety" },
  // Pricing is hidden while PRICING_VISIBLE is false.
  ...(PRICING_VISIBLE ? [{ href: ROUTES.pricing, label: "Pricing" }] : []),
];

/**
 * Top navigation. `dashboardHref` is passed from the root layout (a server
 * component) and is non-null only when a user is signed in — in that case we
 * show a Dashboard link + Log out instead of Log in / Sign up.
 */
export function Navbar({ dashboardHref }: { dashboardHref?: string | null }) {
  const [open, setOpen] = useState(false);
  const signedIn = Boolean(dashboardHref);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <Image
            src={logo}
            alt={APP_NAME + " logo"}
            priority
            className="h-11 w-11 rounded-lg object-contain"
          />
          <span className="text-lg font-bold uppercase tracking-wide text-slate-900">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            {signedIn ? (
              <>
                <Link href={dashboardHref!}>
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href={ROUTES.login}>
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href={ROUTES.signup}>
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className={cn("block h-0.5 w-5 bg-current transition", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-5 bg-current transition", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-5 bg-current transition", open && "-translate-y-2 -rotate-45")} />
          </div>
        </button>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            {signedIn ? (
              <div className="mt-2 flex flex-col gap-2">
                <Link href={dashboardHref!} onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                </Link>
                <div onClick={() => setOpen(false)}>
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link href={ROUTES.login} className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Log in</Button>
                </Link>
                <Link href={ROUTES.signup} className="flex-1" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
