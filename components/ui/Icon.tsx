import type { SVGProps } from "react";

/**
 * Lightweight inline-SVG icon set (no icon dependency). Each icon inherits
 * `currentColor` and sizes via Tailwind classes, e.g. <Icon name="shield" className="h-5 w-5" />.
 */

export type IconName =
  | "shield"
  | "lock"
  | "eye-off"
  | "badge-check"
  | "check"
  | "user"
  | "handshake"
  | "search"
  | "document"
  | "no-document"
  | "scale"
  | "arrow-right"
  | "spark"
  | "tag"
  | "message";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

const paths: Record<IconName, React.ReactNode> = {
  shield: <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.4 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 9 7-.4 1-1.2 2.2-2.4 3.3M6.1 6.6C3.8 8 2.3 10 2 12c.5 1.5 2 3.6 4.5 5" />
    </>
  ),
  "badge-check": (
    <>
      <path d="M12 2.5l2.1 1.6 2.6-.2 1 2.4 2.2 1.4-.6 2.6.6 2.6-2.2 1.4-1 2.4-2.6-.2L12 21.5l-2.1-1.6-2.6.2-1-2.4-2.2-1.4.6-2.6-.6-2.6 2.2-1.4 1-2.4 2.6.2L12 2.5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  check: <path d="M5 12l4 4 10-10" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </>
  ),
  handshake: (
    <>
      <path d="M3 11l4-4 4 3 2-1 4 4" />
      <path d="M13 13l3 3 2-1 3-3-4-4" />
      <path d="M11 13l-2 2a1.5 1.5 0 0 0 2 2l1-1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
    </>
  ),
  "no-document": (
    <>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M3 3l18 18" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16" />
      <path d="M5 8h14" />
      <path d="M7 4h10" />
      <path d="M5 8l-2.5 6a3 3 0 0 0 5 0L5 8z" />
      <path d="M19 8l-2.5 6a3 3 0 0 0 5 0L19 8z" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  spark: <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />,
  tag: (
    <>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  message: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1z" />,
};

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
