import type { IconName } from "@/components/ui/Icon";

/**
 * Reference data for the Safety page: how to verify a lender, broker, or
 * financing company in Canada, and official links to check them.
 *
 * Researched June 2026 from regulator / government sources. These are public
 * verification destinations only — Loan Market does not verify, vet, or endorse
 * any lender, and appearing in a registry is not an endorsement. If a link
 * moves, search the organisation name shown next to it.
 */

export type VerificationLink = { label: string; href: string };

const CBR: VerificationLink = {
  label: "Canada's Business Registries",
  href: "https://ised-isde.canada.ca/cbr-rec/en/search",
};

/** "How do I verify them?" — one line per lender/broker type. */
export const VERIFY_BY_TYPE: { icon: IconName; type: string; how: string }[] = [
  {
    icon: "shield",
    type: "Bank",
    how: "Confirm it on OSFI's federal register. Banks are chartered and federally supervised rather than \u201clicensed\u201d.",
  },
  {
    icon: "handshake",
    type: "Credit union / caisse populaire",
    how: "Confirm it with the provincial regulator where it operates (a few are federal, under OSFI).",
  },
  {
    icon: "document",
    type: "Financing company",
    how: "Confirm the corporate identity in a corporate registry. If it offers high-cost, payday, or money-services lending, also confirm the provincial licence or FINTRAC registration.",
  },
  {
    icon: "badge-check",
    type: "Mortgage broker / agent",
    how: "Confirm the licence with the provincial mortgage regulator \u2014 this is the only type that carries a personal/firm licence number.",
  },
];

/** National (federal) destinations that apply across every province. */
export const NATIONAL_VERIFICATION_LINKS: {
  icon: IconName;
  title: string;
  href: string;
  description: string;
}[] = [
  {
    icon: "shield",
    title: "OSFI \u2014 Who we regulate",
    href: "https://www.osfi-bsif.gc.ca/en/supervision/who-we-regulate",
    description: "Confirm a bank or other federally regulated financial institution.",
  },
  {
    icon: "search",
    title: "Canada's Business Registries",
    href: "https://ised-isde.canada.ca/cbr-rec/en/search",
    description:
      "Search a financing company's corporate registration across most provinces and the federal registry.",
  },
  {
    icon: "document",
    title: "Corporations Canada",
    href: "https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html",
    description: "Confirm that a federally incorporated company exists and is active.",
  },
  {
    icon: "scale",
    title: "FINTRAC \u2014 Money Services Business Registry",
    href: "https://fintrac-canafe.canada.ca/msb-esm/reg-eng",
    description:
      "Check money-services businesses (currency exchange, transfers). Registration is not a licence or endorsement.",
  },
];

export type ProvinceVerification = {
  name: string;
  creditUnion: VerificationLink | null;
  corporate: VerificationLink | null;
  lenderLicence: VerificationLink | null;
  mortgage: VerificationLink | null;
};

/** Province / territory verification links by category. */
export const PROVINCE_VERIFICATION_LINKS: ProvinceVerification[] = [
  {
    name: "Alberta",
    creditUnion: { label: "Credit Union Deposit Guarantee Corp (AB)", href: "https://www.cudgc.ab.ca/" },
    corporate: CBR,
    lenderLicence: { label: "Alberta \u2014 high-cost credit licence", href: "https://www.alberta.ca/high-cost-credit-business-licence" },
    mortgage: { label: "RECA \u2014 public broker/agent search", href: "https://public.myreca.ca/Pages/PublicSearch.aspx" },
  },
  {
    name: "British Columbia",
    creditUnion: { label: "BCFSA \u2014 authorized credit unions", href: "https://www.bcfsa.ca/public-resources/credit-unions/bc-authorized-credit-unions" },
    corporate: CBR,
    lenderLicence: { label: "Consumer Protection BC \u2014 high-cost credit", href: "https://www.consumerprotectionbc.ca/get-keep-licence/high-cost-credit-granting/" },
    mortgage: { label: "BCFSA \u2014 find a mortgage broker", href: "https://www.bcfsa.ca/public-resources/mortgage-brokers/find-mortgage-broker" },
  },
  {
    name: "Manitoba",
    creditUnion: { label: "Deposit Guarantee Corp of Manitoba", href: "https://dgcm.ca/" },
    corporate: CBR,
    lenderLicence: { label: "Manitoba Consumer Protection Office", href: "https://www.gov.mb.ca/cp/cpo/" },
    mortgage: { label: "Manitoba Securities Commission", href: "https://www.mbsecurities.ca/" },
  },
  {
    name: "New Brunswick",
    creditUnion: { label: "Financial & Consumer Services Comm. (FCNB)", href: "https://fcnb.ca/" },
    corporate: { label: "Service New Brunswick", href: "https://www2.snb.ca/" },
    lenderLicence: { label: "FCNB \u2014 check registration", href: "https://www.fcnb.ca/en/check-registration" },
    mortgage: { label: "FCNB \u2014 licensed mortgage brokerages", href: "https://portal.fcnb.ca/LicensedMortgageBrokeragesAndAdministrators/" },
  },
  {
    name: "Newfoundland & Labrador",
    creditUnion: { label: "Credit Union Deposit Guarantee Corp (NL)", href: "https://www.cudgcnl.com/" },
    corporate: { label: "Digital Government and Service NL", href: "https://www.gov.nl.ca/dgsnl/" },
    lenderLicence: { label: "Service NL \u2014 Consumer Affairs", href: "https://www.gov.nl.ca/dgsnl/" },
    mortgage: { label: "Service NL \u2014 licensed mortgage brokers", href: "https://www.gov.nl.ca/gs/mortgage-broker-reg/valid-licenses-mortgagebrokers/" },
  },
  {
    name: "Northwest Territories",
    creditUnion: null,
    corporate: CBR,
    lenderLicence: null,
    mortgage: { label: "Not Available" },
  },
  {
    name: "Nova Scotia",
    creditUnion: { label: "Nova Scotia CU Deposit Insurance Corp", href: "https://nscudic.org/" },
    corporate: CBR,
    lenderLicence: null,
    mortgage: { label: "Service Nova Scotia \u2014 licensed brokers", href: "https://businesslicencing.novascotia.ca/#/mra_details/brokers" },
  },
  {
    name: "Nunavut",
    creditUnion: null,
    corporate: CBR,
    lenderLicence: null,
    mortgage: { label: "Not Available" },
  },
  {
    name: "Ontario",
    creditUnion: { label: "Financial Services Regulatory Authority (FSRA)", href: "https://www.fsrao.ca/" },
    corporate: CBR,
    lenderLicence: { label: "Consumer Protection Ontario", href: "https://www.ontario.ca/page/consumer-protection-ontario" },
    mortgage: { label: "FSRA \u2014 mortgage brokering", href: "https://www.fsrao.ca/consumers/mortgage-brokering" },
  },
  {
    name: "Prince Edward Island",
    creditUnion: { label: "PEI Credit Union Deposit Insurance Corp", href: "http://www.peicudic.com/" },
    corporate: CBR,
    lenderLicence: { label: "PEI Consumer Services", href: "https://www.princeedwardisland.ca/en/topic/consumer-services" },
    mortgage: { label: "PEI Consumer Services", href: "https://www.princeedwardisland.ca/en/topic/consumer-services" },
  },
  {
    name: "Quebec",
    creditUnion: { label: "Autorit\u00e9 des march\u00e9s financiers (AMF)", href: "https://lautorite.qc.ca/en/general-public/registers" },
    corporate: CBR,
    lenderLicence: { label: "Office de la protection du consommateur", href: "https://www.opc.gouv.qc.ca/" },
    mortgage: { label: "AMF \u2014 authorized firms & individuals", href: "https://lautorite.qc.ca/en/general-public/registers/register-of-firms-and-individuals-authorized-to-practice" },
  },
  {
    name: "Saskatchewan",
    creditUnion: { label: "Credit Union Deposit Guarantee Corp (SK)", href: "https://www.cudgc.sk.ca/" },
    corporate: CBR,
    lenderLicence: { label: "Financial & Consumer Affairs Authority (FCAA)", href: "https://fcaa.gov.sk.ca/" },
    mortgage: { label: "FCAA \u2014 mortgage broker search", href: "https://fcaa.saskatchewan.ca/apex/f?p=200:9996:8239579551936::::CMS_SITE%2CCMS_PAGE:FCAA_411%2CMRT_ASC" },
  },
  {
    name: "Yukon",
    creditUnion: null,
    corporate: CBR,
    lenderLicence: null,
    mortgage: { label: "Not Available" },
  },
];
