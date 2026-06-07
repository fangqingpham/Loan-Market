import { Input, Select, Textarea, Badge, Icon } from "@/components/ui";
import { RangeSelectWithCustom } from "./RangeSelectWithCustom";
import {
  LOAN_CATEGORIES,
  PROVINCES,
  SECURED_STATUS_OPTIONS,
  AMOUNT_RANGES,
  PURPOSE_CATEGORIES,
  CREDIT_SCORE_RANGES,
  INCOME_RANGES,
  EMPLOYMENT_TYPES,
  LOAN_TERM_RANGES,
  INTEREST_RANGES,
  LOAN_REQUEST_POSTING_WARNING,
} from "@/lib/constants";

export interface LoanRequestFormValues {
  loan_category?: string | null;
  province?: string | null;
  city?: string | null;
  amount_range?: string | null;
  purpose_category?: string | null;
  secured_status?: string | null;
  credit_score_range?: string | null;
  income_range?: string | null;
  employment_type?: string | null;
  loan_term_range?: string | null;
  expected_interest_range?: string | null;
  borrower_note?: string | null;
}

interface LoanRequestFormProps {
  /** Server action handling the submission. */
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  /** When set, renders a hidden `id` field (edit mode). */
  requestId?: string;
  defaultValues?: LoanRequestFormValues;
}

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));
const optional = (values: string[]) => [
  { value: "", label: "— Optional —" },
  ...toOptions(values),
];

export function LoanRequestForm({
  action,
  submitLabel,
  requestId,
  defaultValues = {},
}: LoanRequestFormProps) {
  const d = defaultValues;

  return (
    <form action={action} className="space-y-8">
      {requestId && <input type="hidden" name="id" value={requestId} />}

      {/* ── Public preview fields ─────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="search" className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Public preview
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            These fields appear in the request preview that anyone can see. They never
            include your name or contact details.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="loan_category"
            name="loan_category"
            label="Loan category *"
            required
            placeholder="Select a category"
            defaultValue={d.loan_category ?? ""}
            options={LOAN_CATEGORIES}
          />
          <Select
            id="province"
            name="province"
            label="Province *"
            required
            placeholder="Select a province"
            defaultValue={d.province ?? ""}
            options={PROVINCES}
          />
          <Input
            id="city"
            name="city"
            label="City (optional)"
            defaultValue={d.city ?? ""}
            placeholder="e.g. Toronto"
          />
          <RangeSelectWithCustom
            name="amount_range"
            label="Amount range *"
            required
            placeholder="Select an amount range"
            defaultValue={d.amount_range ?? ""}
            options={AMOUNT_RANGES.map((v) => ({ value: v, label: v }))}
            customPlaceholder="e.g. $550,000"
          />
          <Select
            id="purpose_category"
            name="purpose_category"
            label="Purpose (optional)"
            defaultValue={d.purpose_category ?? ""}
            options={optional(PURPOSE_CATEGORIES)}
          />
          <Select
            id="secured_status"
            name="secured_status"
            label="Secured status (optional)"
            defaultValue={d.secured_status ?? ""}
            options={[{ value: "", label: "— Optional —" }, ...SECURED_STATUS_OPTIONS]}
          />
        </div>
      </section>

      {/* ── Verified lender-only fields ───────────────────────── */}
      <section className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Icon name="badge-check" className="h-4 w-4 text-verified-700" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Lenders/brokers only
            </h2>
            <Badge tone="verified">Hidden from the public</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Optional. These details are shown only to signed-in lenders and brokers to help them gauge
            fit. Keep them general — never enter exact figures or documents.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="credit_score_range"
            name="credit_score_range"
            label="Credit score range (optional)"
            defaultValue={d.credit_score_range ?? ""}
            options={optional(CREDIT_SCORE_RANGES)}
          />
          <RangeSelectWithCustom
            name="income_range"
            label="Income range (optional)"
            defaultValue={d.income_range ?? ""}
            options={optional(INCOME_RANGES)}
            customPlaceholder="e.g. $185,000"
          />
          <Select
            id="employment_type"
            name="employment_type"
            label="Employment type (optional)"
            defaultValue={d.employment_type ?? ""}
            options={optional(EMPLOYMENT_TYPES)}
          />
          <Select
            id="loan_term_range"
            name="loan_term_range"
            label="Preferred loan term (optional)"
            defaultValue={d.loan_term_range ?? ""}
            options={optional(LOAN_TERM_RANGES)}
          />
          <Select
            id="expected_interest_range"
            name="expected_interest_range"
            label="Expected interest range (optional)"
            defaultValue={d.expected_interest_range ?? ""}
            options={optional(INTEREST_RANGES)}
          />
        </div>

        <Textarea
          id="borrower_note"
          name="borrower_note"
          label="Note to lenders (optional)"
          defaultValue={d.borrower_note ?? ""}
          maxLength={1000}
          placeholder="Add helpful context about your situation. Do not include personal identifiers, documents, or exact account details."
        />
        <p className="text-xs text-slate-500">
          Please do not include phone numbers, emails, websites, or social handles. Contact details are shared only after approval.
        </p>
      </section>

      {/* ── Required safety warning + acknowledgement ─────────── */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700">
            <Icon name="shield" className="h-4 w-4" />
          </span>
          <div className="space-y-3">
            <p className="text-sm font-medium text-amber-900">Before you post</p>
            <p className="text-sm leading-relaxed text-amber-900">
              {LOAN_REQUEST_POSTING_WARNING}
            </p>
            <label className="flex items-start gap-2 text-sm font-medium text-amber-900">
              <input
                type="checkbox"
                name="agree"
                required
                className="mt-0.5 h-4 w-4 rounded border-amber-400"
              />
              <span>I understand and agree.</span>
            </label>
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}
