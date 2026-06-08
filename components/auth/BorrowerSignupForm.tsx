"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { TermsAgreementField } from "@/components/auth/TermsAgreementField";
import { signupBorrowerAction } from "@/app/(auth)/actions";

type Option = { value: string; label: string };

export function BorrowerSignupForm({ provinceOptions }: { provinceOptions: Option[] }) {
  const [termsAgreed, setTermsAgreed] = useState(false);

  return (
    <form action={signupBorrowerAction} className="space-y-4">
      <Input name="full_name" label="Full name" autoComplete="name" />
      <Input name="email" type="email" label="Email" required autoComplete="email" />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      <Input name="phone" type="tel" label="Phone (optional - verification added later)" autoComplete="tel" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="city" label="City (optional)" />
        <Select name="province" label="Province (optional)" options={provinceOptions} />
      </div>
      <TermsAgreementField agreed={termsAgreed} onAgreeChange={setTermsAgreed} />
      <Button type="submit" disabled={!termsAgreed} className="w-full">
        Create borrower account
      </Button>
    </form>
  );
}
