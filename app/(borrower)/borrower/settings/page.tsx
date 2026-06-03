import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Icon } from "@/components/ui";
import { updateBorrowerSettingsAction } from "@/app/(borrower)/borrower/actions";
import { createClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/auth";
import { PROVINCES } from "@/lib/constants";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "Settings" };

type BorrowerProfileRow = Database["public"]["Tables"]["borrower_profiles"]["Row"];

const provinceOptions = [{ value: "", label: "— Province (optional) —" }, ...PROVINCES];

export default async function BorrowerSettingsPage({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string };
}) {
  const profile = await getCurrentProfile();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let bp: BorrowerProfileRow | null = null;
  if (user) {
    const { data } = await supabase
      .from("borrower_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    bp = data as BorrowerProfileRow | null;
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your display details. Your email and phone are private and never shown on
          a loan request.
        </p>

        {searchParams?.message && (
          <div className="mt-6 rounded-xl border border-verified-500/30 bg-verified-100/50 px-3 py-2 text-sm text-verified-700">
            {searchParams.message}
          </div>
        )}
        {searchParams?.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        {/* Private account info (read-only) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon name="lock" className="h-4 w-4 text-slate-500" />
              Private account info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Name</span>
              <span className="text-slate-900">{profile?.fullName || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-900">{profile?.email || "—"}</span>
            </div>
            <p className="pt-1 text-xs text-slate-500">
              This information is visible only to you and is never displayed to lenders or
              on a loan request.
            </p>
          </CardContent>
        </Card>

        {/* Display details (editable) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Display details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateBorrowerSettingsAction} className="space-y-4">
              <Input
                id="display_name"
                name="display_name"
                label="Display name (optional)"
                defaultValue={bp?.display_name ?? ""}
                placeholder="A name shown only inside approved conversations"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="city"
                  name="city"
                  label="City (optional)"
                  defaultValue={bp?.city ?? ""}
                />
                <Select
                  id="province"
                  name="province"
                  label="Province (optional)"
                  defaultValue={bp?.province ?? ""}
                  options={provinceOptions}
                />
              </div>
              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
