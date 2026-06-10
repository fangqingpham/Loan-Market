import Link from "next/link";
import { Icon } from "./Icon";

/**
 * Server-component-friendly pagination control for the public boards.
 *
 * Renders plain <Link>s that drive a `?page=` query param, preserving any other
 * filter params already on the URL. Page 1 omits the `page` param so the
 * canonical URL stays clean. Returns nothing when there's only a single page.
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  params = {},
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  /** Other query params to carry across page changes (e.g. active filters). */
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const base =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium";
  const link = `${base} border-slate-200 text-slate-700 hover:bg-slate-50`;
  const disabled = `${base} border-slate-200 text-slate-300 cursor-not-allowed`;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} className={link} rel="prev">
          <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" />
          Prev
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true">
          <Icon name="arrow-right" className="h-3.5 w-3.5 rotate-180" />
          Prev
        </span>
      )}

      {pages.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${base} border-brand-600 bg-brand-600 text-white`}
          >
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={link}>
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} className={link} rel="next">
          Next
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true">
          Next
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}
