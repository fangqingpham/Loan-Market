"use client";

import { Input, Select, Icon } from "@/components/ui";
import { PROVINCES } from "@/lib/constants";

/**
 * This form is for PRIVATE LENDERS ONLY. Licensed lenders (broker, agent, bank,
 * credit union, financing company) provide a licence number at signup — they
 * don't fill this in. (Private-lender registration is gated off at launch.)
 */
export interface LenderVerificationValues {
  legal_name?: string | null;
  business_name?: string | null;
  business_email?: string | null;
  phone?: string | null;
  website_or_social?: string | null;
  business_address_or_service_area?: string | null;
  operating_provinces?: string[] | null;
  incorporated_over_1_year?: boolean | null;
  accepts_no_upfront_fee_rule?: boolean | null;
  accepts_interest_compliance?: boolean | null;
  accepts_platform_rules?: boolean | null;
}

interface LenderVerificationFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: LenderVerificationValues;
}

function Check({
  name,
  defaultChecked,
  required,
  children,
}: {
  name: string;
  defaultChecked?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        required={required}
        className="mt-0.5 h-4 w-4 rounded border-slate-300"
      />
      <span>{children}</span>
    </label>
  );
}

export function LenderVerificationForm({
  action,
  defaultValues = {},
}: LenderVerificationFormProps) {
  const d = defaultValues;
  const selectedProvinces = new Set(d.operating_provinces ?? []);

  return (
    <form action={action} className="space-y-8">
      {/* Private-lender notice */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600">
            <Icon name="user" className="h-4 w-4" />
          </span>
          <p className="text-sm text-slate-700">
            This form is for <span className="font-medium">private lenders</span>. If you
            are a licensed broker, agent, bank, credit union, or financing company, you
            provide a licence number at signup — you don&apos;t need to complete this form.
          </p>
        </div>
      </div>

      {/* Business identity */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Business details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="legal_name" name="legal_name" label="Legal name *" required defaultValue={d.legal_name ?? ""} />
          <Input id="business_name" name="business_name" label="Business name *" required defaultValue={d.business_name ?? ""} />
          <Input id="business_email" name="business_email" type="email" label="Business email *" required defaultValue={d.business_email ?? ""} />
          <Input id="phone" name="phone" type="tel" label="Phone *" required defaultValue={d.phone ?? ""} />
          <Input id="website_or_social" name="website_or_social" label="Website or social profile" defaultValue={d.website_or_social ?? ""} placeholder="https://" />
        </div>
        <Input
          id="business_address_or_service_area"
          name="business_address_or_service_area"
          label="Business address or service area"
          defaultValue={d.business_address_or_service_area ?? ""}
          placeholder="e.g. Greater Toronto Area, or a business address"
        />
      </section>

      {/* Operating provinces */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Operating provinces *
        </h2>
        <p className="text-sm text-slate-600">Select every province or territory you serve.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROVINCES.map((p) => (
            <label key={p.value} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="operating_provinces"
                value={p.value}
                defaultChecked={selectedProvinces.has(p.value)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {p.label}
            </label>
          ))}
        </div>
      </section>

      {/* Private-lender confirmations (required) */}
      <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <Icon name="shield" className="h-4 w-4 text-amber-700" />
          <p className="text-sm font-medium text-amber-900">Private lender confirmations</p>
        </div>
        <Check name="incorporated_over_1_year" defaultChecked={Boolean(d.incorporated_over_1_year)}>
          My business has been incorporated for over 1 year.
        </Check>
        <Check name="accepts_no_upfront_fee_rule" defaultChecked={Boolean(d.accepts_no_upfront_fee_rule)} required>
          I accept the no-upfront-fee rule (I will not charge borrowers upfront fees to secure a loan).
        </Check>
        <Check name="accepts_interest_compliance" defaultChecked={Boolean(d.accepts_interest_compliance)} required>
          I will comply with all legal interest-rate limits.
        </Check>
        <Check name="accepts_platform_rules" defaultChecked={Boolean(d.accepts_platform_rules)} required>
          I accept the platform posting rules (honest conduct, no prohibited content, consent-based contact).
        </Check>
        <Check name="confirms_legal_responsibility" required>
          I confirm that I am solely responsible for my own licensing and legal compliance, and that Loan Market does not verify, endorse, or arrange loans.
        </Check>
      </section>

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Icon name="badge-check" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          Submitting sends your details to our team for review. Account activation is
          granted by an admin — it isn&apos;t automatic, and submitting doesn&apos;t change your
          status by itself.
        </p>
      </div>

      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Submit details
      </button>
    </form>
  );
}
