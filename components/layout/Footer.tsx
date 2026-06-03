import Link from "next/link";
import { Container } from "./Container";
import { APP_NAME, APP_PROMISE, ROUTES } from "@/lib/constants";

const footerGroups: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: ROUTES.howItWorks, label: "How it works" },
      { href: ROUTES.borrowers, label: "For borrowers" },
      { href: ROUTES.lenders, label: "For lenders" },
      { href: ROUTES.pricing, label: "Pricing" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { href: ROUTES.safety, label: "Safety" },
      { href: ROUTES.faq, label: "FAQ" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: ROUTES.terms, label: "Terms of Service" },
      { href: ROUTES.privacy, label: "Privacy Policy" },
      { href: ROUTES.disclaimer, label: "Disclaimer" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                LM
              </span>
              <span className="text-base font-semibold text-slate-900">{APP_NAME}</span>
            </Link>
            <p className="max-w-xs text-sm text-slate-600">{APP_PROMISE}</p>
          </div>

          {/* Link groups */}
          {footerGroups.map((group) => (
            <div key={group.heading}>
              <p className="text-sm font-semibold text-slate-900">{group.heading}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500">
            &copy; {year} {APP_NAME}. A privacy-first loan marketplace. {APP_NAME} is an
            introduction platform and does not lend, broker, approve, underwrite,
            recommend, or arrange loans.
          </p>
        </div>
      </Container>
    </footer>
  );
}
