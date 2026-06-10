import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import {
  LICENSED_LENDER_LABEL,
  PRIMARY_REGULATOR_REGISTER_URL,
  REGULATOR_CHECK_CTA,
  ONTARIO_ONLY_NOTE,
  ROUTES,
} from "@/lib/constants";

/**
 * Neutral credential note shown on public lender/broker and product cards.
 *
 * Conduit posture (no "verified"/"verification" claims anywhere):
 *  - When a licence number is on file (typically a mortgage broker/agent), it
 *    is shown as SELF-REPORTED — Loan Market does not confirm it.
 *  - Banks, credit unions, and financing companies do not carry a licence
 *    number, so no licence line is shown for them.
 *  - In every case we link out to the Safety page, which lists official
 *    regulator and registry resources a borrower can use to check a
 *    lender/broker's credentials themselves. Loan Market never confirms them.
 */
export function LicenceBadge({ licenceNumber }: { licenceNumber: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      {licenceNumber && (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">
              <Icon name="badge-check" className="h-3.5 w-3.5" />
              {LICENSED_LENDER_LABEL}
            </Badge>
            <span className="text-sm text-slate-500">
              Licence #{licenceNumber} <span className="text-slate-400">(self-reported)</span>
            </span>
          </div>

          {/* Ontario mortgage broker/agent licence lookup (FSRA, formerly FSCO).
              Covers ONTARIO licences only — an outbound link to the regulator's
              own public register. Loan Market neither caches nor confirms the
              data; borrowers check it themselves. */}
          <a
            href={PRIMARY_REGULATOR_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            {REGULATOR_CHECK_CTA} (Ontario Mortgage Broker/Agent)
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </a>
          <span className="text-xs text-slate-400">{ONTARIO_ONLY_NOTE}</span>
        </div>
      )}

      {/* Credential-check resources live on the Safety page (regulator + registry
          links by province). This is the link KEPT for other provinces and for
          credentials other than an Ontario mortgage broker/agent licence — banks,
          credit unions, and financing companies don't carry a licence number, so
          they're pointed here rather than to the Ontario-only lookup above. */}
      <Link
        href={ROUTES.safety}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
      >
        Reference links to check other credentials &amp; provinces
        <Icon name="arrow-right" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
