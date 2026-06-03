"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Select } from "@/components/ui";
import {
  LOAN_CATEGORIES,
  PROVINCES,
  AMOUNT_RANGES,
  SECURED_STATUS_OPTIONS,
} from "@/lib/constants";

const any = { value: "", label: "All" };

const categoryOptions = [any, ...LOAN_CATEGORIES];
const provinceOptions = [any, ...PROVINCES];
const amountOptions = [any, ...AMOUNT_RANGES.map((v) => ({ value: v, label: v }))];
const securedOptions = [any, ...SECURED_STATUS_OPTIONS];

/**
 * Client-side filter bar for the public loan-request board. Updates the URL
 * search params on change so the server component re-fetches with filters.
 */
export function LoanRequestFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Select
        id="filter-category"
        label="Category"
        value={params.get("category") ?? ""}
        onChange={(e) => set("category", e.target.value)}
        options={categoryOptions}
      />
      <Select
        id="filter-province"
        label="Province"
        value={params.get("province") ?? ""}
        onChange={(e) => set("province", e.target.value)}
        options={provinceOptions}
      />
      <Select
        id="filter-amount"
        label="Amount range"
        value={params.get("amount") ?? ""}
        onChange={(e) => set("amount", e.target.value)}
        options={amountOptions}
      />
      <Select
        id="filter-secured"
        label="Secured status"
        value={params.get("secured") ?? ""}
        onChange={(e) => set("secured", e.target.value)}
        options={securedOptions}
      />
    </div>
  );
}
