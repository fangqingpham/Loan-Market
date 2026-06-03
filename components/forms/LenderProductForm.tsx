import { Input, Select, Textarea, Icon } from "@/components/ui";
import {
  LOAN_CATEGORIES,
  SECURED_STATUS_OPTIONS,
  AMOUNT_RANGES,
  LOAN_TERM_RANGES,
  RATE_RANGES,
  PRODUCT_POSTING_NOTE,
} from "@/lib/constants";

export interface LenderProductFormValues {
  product_title?: string | null;
  loan_category?: string | null;
  service_area?: string | null;
  amount_range?: string | null;
  term_range?: string | null;
  rate_range?: string | null;
  secured_status?: string | null;
  product_description?: string | null;
  important_conditions?: string | null;
}

interface LenderProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  /** When set, renders a hidden `id` field (edit mode). */
  productId?: string;
  defaultValues?: LenderProductFormValues;
}

const optional = (values: string[]) => [
  { value: "", label: "— Optional —" },
  ...values.map((v) => ({ value: v, label: v })),
];

export function LenderProductForm({
  action,
  submitLabel,
  productId,
  defaultValues = {},
}: LenderProductFormProps) {
  const d = defaultValues;

  return (
    <form action={action} className="space-y-8">
      {productId && <input type="hidden" name="id" value={productId} />}

      <section className="space-y-4">
        <Input
          id="product_title"
          name="product_title"
          label="Product title *"
          required
          maxLength={120}
          defaultValue={d.product_title ?? ""}
          placeholder="e.g. Flexible second mortgage for self-employed"
        />
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
          <Input
            id="service_area"
            name="service_area"
            label="Service area"
            defaultValue={d.service_area ?? ""}
            placeholder="e.g. Ontario, or Greater Toronto Area"
          />
          <Select
            id="amount_range"
            name="amount_range"
            label="Amount range"
            defaultValue={d.amount_range ?? ""}
            options={optional(AMOUNT_RANGES)}
          />
          <Select
            id="term_range"
            name="term_range"
            label="Term range"
            defaultValue={d.term_range ?? ""}
            options={optional(LOAN_TERM_RANGES)}
          />
          <Select
            id="rate_range"
            name="rate_range"
            label="Rate range"
            defaultValue={d.rate_range ?? ""}
            options={optional(RATE_RANGES)}
          />
          <Select
            id="secured_status"
            name="secured_status"
            label="Secured status"
            defaultValue={d.secured_status ?? ""}
            options={[{ value: "", label: "— Optional —" }, ...SECURED_STATUS_OPTIONS]}
          />
        </div>

        <Textarea
          id="product_description"
          name="product_description"
          label="Product description"
          defaultValue={d.product_description ?? ""}
          maxLength={2000}
          placeholder="Describe the product in general terms: who it suits, typical structure, what makes it competitive."
        />
        <Textarea
          id="important_conditions"
          name="important_conditions"
          label="Important conditions"
          defaultValue={d.important_conditions ?? ""}
          maxLength={2000}
          placeholder="Key conditions a borrower should know up front (e.g. minimum down payment, property types, fees)."
        />
      </section>

      {/* Posting note (no contact details) */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700">
            <Icon name="shield" className="h-4 w-4" />
          </span>
          <p className="text-sm leading-relaxed text-amber-900">{PRODUCT_POSTING_NOTE}</p>
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
