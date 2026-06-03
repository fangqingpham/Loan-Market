"use client";

import { useState } from "react";
import { Select, Input } from "@/components/ui";

const CUSTOM = "__custom__";

interface Option {
  value: string;
  label: string;
}

interface RangeSelectWithCustomProps {
  /** Form field name — this is what gets submitted (a range label or a typed amount). */
  name: string;
  label: string;
  /** Range options (already including any leading "— Optional —" entry). */
  options: Option[];
  required?: boolean;
  /** Placeholder for a required select (disabled first option). */
  placeholder?: string;
  customLabel?: string;
  customPlaceholder?: string;
  /** Existing stored value — may be a preset label or a previously-typed amount. */
  defaultValue?: string;
}

/**
 * A range <select> with an extra "Enter a specific amount" choice. Picking it
 * reveals a text input; the component submits a single hidden field (`name`)
 * carrying either the chosen range or the typed amount, so the server action
 * and DB column are unchanged.
 */
export function RangeSelectWithCustom({
  name,
  label,
  options,
  required = false,
  placeholder,
  customLabel = "Enter a specific amount",
  customPlaceholder = "e.g. $185,000",
  defaultValue = "",
}: RangeSelectWithCustomProps) {
  const presetValues = options.map((o) => o.value);
  const startsCustom = defaultValue !== "" && !presetValues.includes(defaultValue);

  const [choice, setChoice] = useState(startsCustom ? CUSTOM : defaultValue);
  const [custom, setCustom] = useState(startsCustom ? defaultValue : "");

  const submittedValue = choice === CUSTOM ? custom : choice;
  const allOptions: Option[] = [...options, { value: CUSTOM, label: customLabel }];

  return (
    <div className="space-y-2">
      {/* The single value actually submitted with the form. */}
      <input type="hidden" name={name} value={submittedValue} />

      <Select
        label={label}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        required={required}
        placeholder={placeholder}
        options={allOptions}
      />

      {choice === CUSTOM && (
        <Input
          aria-label={`${label}: specific amount`}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={customPlaceholder}
          required={required}
          maxLength={40}
        />
      )}
    </div>
  );
}
