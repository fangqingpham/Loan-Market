import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * The "how it works" content now lives at /how-it-works (Stage 4 marketing
 * site). This route is kept as a permanent redirect so any old links and the
 * previous nav target still resolve to the canonical page.
 */
export default function AboutPage() {
  redirect(ROUTES.howItWorks);
}
