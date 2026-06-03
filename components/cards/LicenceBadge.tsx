import { Badge, Icon } from "@/components/ui";
import {
  LICENSED_LENDER_LABEL,
  REGULATOR_CHECK_CTA,
  PRIMARY_REGULATOR_REGISTER_URL,
  ONTARIO_ONLY_NOTE,
  OTHER_PROVINCE_REGULATORS,
} from "@/lib/constants";

/**
 * Neutral licence display used on public lender/product cards.
 *
 * Deliberate conduit posture (no "verified"/"verification" anywhere):
 *  - Shows a factual "Licensed lender" tag, NOT an endorsement.
 *  - Shows the licence number as SELF-REPORTED by the lender.
 *  - Links the user OUT to the regulator's official public register so they
 *    confirm it themselves. Loan Market never claims to have confirmed it.
 *  - The primary link is the ONTARIO register (Ontario licences only). A
 *    separate "Other provinces" box lists each province's regulator so a
 *    borrower can confirm a non-Ontario licence with the right body.
 *
 * For a lender with no licence number on file, this renders nothing (private
 * lenders are not enabled at launch; if one ever appears, we simply show no
 * licence claim rather than implying one).
 */
export function LicenceBadge({ licenceNumber }: { licenceNumber: string | null }) {
  if (!licenceNumber) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          <Icon name="badge-check" className="h-3.5 w-3.5" />
          {LICENSED_LENDER_LABEL}
        </Badge>
        <span className="text-sm text-slate-500">
          Licence #{licenceNumber} <span className="text-slate-400">(self-reported)</span>
        </span>
      </div>

      {/* Ontario primary lookup + scope note */}
      <div className="flex flex-col gap-0.5">
        <a
          href={PRIMARY_REGULATOR_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          {REGULATOR_CHECK_CTA}
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </a>
        <span className="text-xs text-slate-400">{ONTARIO_ONLY_NOTE}</span>
      </div>

      {/* Other provinces — regulator licence-search resources */}
      <details className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="search" className="h-3.5 w-3.5 text-slate-400" />
            Other provinces — licence search resources
          </span>
          <Icon name="arrow-right" className="h-3.5 w-3.5 text-slate-400" />
        </summary>
        <ul className="mt-2 space-y-1.5">
          {OTHER_PROVINCE_REGULATORS.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 text-xs text-brand-700 underline-offset-2 hover:underline"
              >
                {r.name}
                <Icon name="arrow-right" className="mt-0.5 h-3 w-3 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-400">
          Confirm a lender&apos;s licence with the relevant regulator yourself before
          dealing with anyone. Loan Market does not confirm licences.
        </p>
      </details>
    </div>
  );
}
