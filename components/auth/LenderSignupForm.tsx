"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { signupLenderAction } from "@/app/(auth)/actions";
import { LICENCE_REQUIRED_LENDER_TYPES } from "@/lib/constants";
import type { LenderType } from "@/types/database";

type Option = { value: string; label: string };

/**
 * Lender/Broker signup form (client component).
 *
 * The licence-number field is conditional: only mortgage brokers and agents
 * carry a personal/firm licence, so the field is shown — and required — only
 * for those types. Banks, credit unions, and financing companies are
 * authorized/registered rather than licensed, so the field is hidden and not
 * submitted for them. The matching requirement is also enforced server-side in
 * `signupLenderAction` (this is UX, not the security boundary).
 */
export function LenderSignupForm({
  lenderTypeOptions,
  provinceOptions,
  intakeNote,
}: {
  lenderTypeOptions: Option[];
  provinceOptions: Option[];
  intakeNote: string;
}) {
  const [lenderType, setLenderType] = useState("");
  const requiresLicence = LICENCE_REQUIRED_LENDER_TYPES.includes(lenderType as LenderType);
  const typeChosen = lenderType !== "";

  return (
    <form action={signupLenderAction} className="space-y-4">
      <Input name="email" type="email" label="Account email" required autoComplete="email" />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      <Input name="business_name" label="Business name" required />
      <Input name="legal_name" label="Legal name (optional)" />
      <Select
        name="lender_type"
        label="Lender/Broker type"
        options={lenderTypeOptions}
        required
        value={lenderType}
        onChange={(e) => setLenderType(e.target.value)}
      />
      <Input name="business_email" type="email" label="Business email (optional)" />
      <Input name="phone" type="tel" label="Business phone (optional)" autoComplete="tel" />
      <Input name="website_or_social" label="Website or social (optional)" />
      <Input name="brokerage_or_company_name" label="Brokerage / company name (optional)" />

      {requiresLicence ? (
        <Input
          name="licence_number"
          label="Licence number"
          required
          placeholder="Your regulator licence number"
        />
      ) : typeChosen ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Banks, credit unions, and financing companies aren&apos;t individually licensed the way
          mortgage brokers and agents are, so no licence number is needed here. Borrowers can
          confirm your corporate registration or regulator using the verification links Loan
          Market provides.
        </p>
      ) : null}

      <Select name="province" label="Primary operating province (optional)" options={provinceOptions} />
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        {intakeNote}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 rounded border-slate-300" />
        <span>I agree to the Terms of Service, Privacy Policy, and Disclaimer.</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="agree_rules" required className="mt-0.5 h-4 w-4 rounded border-slate-300" />
        <span>I agree to the platform rules (no upfront fees, interest-rate compliance, honest conduct).</span>
      </label>
      <Button type="submit" className="w-full">Create account</Button>
    </form>
  );
}
