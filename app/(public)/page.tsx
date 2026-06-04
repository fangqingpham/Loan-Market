import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button, Card, CardContent, CardTitle, Badge, Icon, type IconName } from "@/components/ui";
import { CTASection } from "@/components/marketing/CTASection";
import { Section } from "@/components/marketing/Section";
import {
  APP_NAME,
  APP_PROMISE,
  MARKETING_LOAN_CATEGORIES,
  PRICING_VISIBLE,
  ROUTES,
} from "@/lib/constants";

/* ── Section data ─────────────────────────────────────────────── */

/** The three coral "service" cards that bridge the hero and the page body. */
const heroCards: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "tag",
    title: "Free for borrowers",
    body: "Post a loan request in minutes. No fees, and your contact details stay private.",
  },
  {
    icon: "badge-check",
    title: "Licensed lenders",
    body: "Lenders display a licence number you can confirm with the regulator yourself.",
  },
  {
    icon: "shield",
    title: "Consent-based contact",
    body: "Nobody reaches you until you approve them. You stay in control the whole way.",
  },
];

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "document",
    title: "Post your request",
    body: "Borrowers describe what they need in a few minutes. It's free, and your contact details are never shown publicly.",
  },
  {
    icon: "badge-check",
    title: "Licensed lenders respond",
    body: "Lenders who provide a licence number and agree to the platform rules can see your request and ask to connect.",
  },
  {
    icon: "handshake",
    title: "You approve the connection",
    body: "A lender's request stays pending until you approve it. Only then does private messaging open.",
  },
];

const borrowerPoints: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "tag",
    title: "Free to post",
    body: "Posting a loan request costs nothing. There are no fees for borrowers to be matched with licensed lenders.",
  },
  {
    icon: "eye-off",
    title: "Your contact info is hidden",
    body: "Your phone and email stay private until you choose to approve a lender's request.",
  },
  {
    icon: "no-document",
    title: "No document uploads",
    body: "We don't ask you to upload financial documents or ID to post a request.",
  },
];

const lenderPoints: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "search",
    title: "Relevant requests",
    body: "Browse loan requests that match the categories and regions you serve.",
  },
  {
    icon: "badge-check",
    title: "Show your licence",
    body: "Display your licence number on your listings so borrowers can look you up with the regulator themselves.",
  },
  {
    icon: "user",
    title: "Connect with consent",
    body: "Reach out to borrowers who have approved your contact request — no cold lists, no scraping.",
  },
];

const safetyPoints: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "We are not a lender",
    body: "Loan Market does not lend money, and does not broker, approve, underwrite, recommend, or arrange loans.",
  },
  {
    icon: "lock",
    title: "Privacy by default",
    body: "Borrower contact information is hidden until the borrower approves a connection.",
  },
  {
    icon: "badge-check",
    title: "Licensed lenders only",
    body: "Lenders provide a licence number you can confirm with the regulator yourself, and agree to the platform rules.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* 1 ── Hero (dark, full-bleed gradient) ─────────────────── */}
      <section className="relative overflow-hidden bg-ink-900">
        {/* Decorative gradient wash + floating orbs (clipped here, on purpose) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-600/30 blur-3xl animate-float" />
          <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl animate-float anim-delay-300" />
        </div>

        <Container className="relative pb-32 pt-20 sm:pb-40 sm:pt-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-accent-400 animate-fade-up">
              <span className="h-px w-8 bg-accent-400" />
              Privacy-first lending marketplace
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white animate-fade-up anim-delay-100 sm:text-6xl">
              Post your loan request.
              <span className="mt-1 block text-gradient-accent">Connect on your terms.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 animate-fade-up anim-delay-200">
              {APP_NAME} is a privacy-first place to share what you need and hear from
              licensed lenders. It&apos;s free for borrowers, and you decide who can contact you.
            </p>
            <div className="mt-9 flex flex-col gap-3 animate-fade-up anim-delay-300 sm:flex-row">
              <Link href={ROUTES.signupBorrower}>
                <Button variant="accent" size="lg" className="w-full rounded-full sm:w-auto">
                  Post a Loan Request
                  <Icon name="arrow-right" className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.signupLender}>
                <Button
                  size="lg"
                  className="w-full rounded-full border border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                >
                  Join as a Licensed Lender
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-xs text-slate-400 animate-fade-up anim-delay-400">
              Free for borrowers · No document uploads · Contact details stay private
            </p>
          </div>
        </Container>
      </section>

      {/* Warm feature cards — pulled up to overlap the hero's bottom edge with a
          comfortable, consistent gap. The hero's extra bottom padding leaves room
          so the cards sit cleanly over the seam without crowding the text. */}
      <div className="relative z-10 -mt-24 sm:-mt-28">
        <Container>
          <div className="grid gap-[1.125rem] sm:grid-cols-3">
            {heroCards.map((card, i) => (
              <div
                key={card.title}
                className={`group rounded-xl bg-accent-600 p-[1.125rem] text-white shadow-accent-glow transition-all duration-300 hover:-translate-y-2 hover:bg-accent-700 animate-fade-up ${delay(i)}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={card.icon} className="h-[1.125rem] w-[1.125rem] text-white" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-white">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/90">{card.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* 2 ── How it works ─────────────────────────────────────── */}
      <Section
        eyebrow="How it works"
        title="Three simple, consent-based steps"
        subtitle="A straightforward flow designed around privacy and consent."
        centered
        className="pt-12 sm:pt-16"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title} interactive className={`group animate-fade-up ${delay(i)}`}>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={step.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-2xl font-extrabold text-slate-200 transition-colors group-hover:text-accent-500">
                    0{i + 1}
                  </span>
                </div>
                <CardTitle>{step.title}</CardTitle>
                <p className="text-sm text-slate-600">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={ROUTES.howItWorks}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            See the full walkthrough
            <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Section>

      {/* 3 ── For borrowers ────────────────────────────────────── */}
      <Section tinted>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <Badge>For borrowers</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Share what you need — privately
            </h2>
            <p className="mt-3 text-base text-slate-600">{APP_PROMISE}</p>
            <p className="mt-3 text-base text-slate-600">
              You stay anonymous until you decide to approve a lender. There is
              nothing to upload and nothing to pay.
            </p>
            <div className="mt-6">
              <Link href={ROUTES.borrowers}>
                <Button variant="outline">Learn more for borrowers</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {borrowerPoints.map((p) => (
              <Card key={p.title} interactive className="group">
                <CardContent className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
                    <Icon name={p.icon} className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="text-sm text-slate-600">{p.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* 4 ── For lenders ──────────────────────────────────────── */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="grid gap-4 lg:order-2">
            {lenderPoints.map((p) => (
              <Card key={p.title} interactive className="group">
                <CardContent className="flex gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verified-100 text-verified-700 transition-transform duration-300 group-hover:scale-110">
                    <Icon name={p.icon} className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="text-sm text-slate-600">{p.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:order-1">
            <Badge tone="verified">For lenders</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reach borrowers who want to hear from you
            </h2>
            <p className="mt-3 text-base text-slate-600">
              List your products, browse requests in the categories you serve, and connect only
              with borrowers who approve your request. It&apos;s free for lenders during launch.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ROUTES.lenders}>
                <Button variant="outline">Learn more for lenders</Button>
              </Link>
              {PRICING_VISIBLE && (
                <Link href={ROUTES.pricing}>
                  <Button variant="ghost">View pricing</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* 5 ── Safety ───────────────────────────────────────────── */}
      <Section
        tinted
        eyebrow="Safety"
        title="Built around trust"
        subtitle="A few principles guide everything on the platform."
        centered
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {safetyPoints.map((p, i) => (
            <Card key={p.title} interactive className={`group animate-fade-up ${delay(i)}`}>
              <CardContent className="space-y-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-verified-100 text-verified-700 transition-all duration-300 group-hover:bg-verified-600 group-hover:text-white">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <p className="text-sm text-slate-600">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={ROUTES.safety}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Read our safety commitments
            <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Section>

      {/* 6 ── Loan categories ──────────────────────────────────── */}
      <Section
        eyebrow="Loan categories"
        title="Requests across common loan types"
        subtitle="Borrowers post requests in the categories below, and licensed lenders connect where they're a fit."
        centered
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MARKETING_LOAN_CATEGORIES.map((category) => (
            <div
              key={category}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lift"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-accent-500 group-hover:text-white">
                <Icon name="tag" className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-slate-700">{category}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 7 ── Closing CTA ──────────────────────────────────────── */}
      <CTASection />
    </>
  );
}

/* Small helper for staggered entrance delays (kept local to this page). */
function delay(i: number): string {
  return ["", "anim-delay-100", "anim-delay-200", "anim-delay-300", "anim-delay-400", "anim-delay-500"][i] ?? "";
}
