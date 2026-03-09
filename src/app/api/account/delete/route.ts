import { NextResponse } from "next/server";
import {
  createRouteSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createRouteSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const serviceClient = createServiceSupabaseClient();

  // 1. Delete draft invoices (allowed by GoBD since they were never sent)
  await serviceClient
    .from("invoices")
    .delete()
    .eq("user_id", userId)
    .eq("status", "draft");

  // 2. Anonymize sent/finalized invoices (GoBD: 10-year retention, but remove personal data)
  await serviceClient
    .from("invoices")
    .update({
      notes: null,
    })
    .eq("user_id", userId)
    .neq("status", "draft");

  // 3. Delete reminders
  await serviceClient.from("reminders").delete().eq("user_id", userId);

  // 4. Delete recurring schedules
  await serviceClient.from("recurring_schedules").delete().eq("user_id", userId);

  // 5. Delete invoice templates
  await serviceClient.from("invoice_templates").delete().eq("user_id", userId);

  // 6. Delete feedback
  await serviceClient.from("feedback").delete().eq("user_id", userId);

  // 7. Delete customers
  //    Note: customers with finalized invoices can't be deleted due to FK constraint,
  //    so we anonymize those instead
  const { error: deleteCustomersError } = await serviceClient
    .from("customers")
    .delete()
    .eq("user_id", userId);

  if (deleteCustomersError) {
    // FK constraint — anonymize instead
    await serviceClient
      .from("customers")
      .update({ name: "Gelöscht", email: null, phone: null, address: null, city: null, zip: null, country: null, notes: null })
      .eq("user_id", userId);
  }

  // 8. Anonymize profile (keep row for FK integrity with retained invoices)
  await serviceClient
    .from("profiles")
    .update({
      full_name: "Gelöscht",
      company_name: null,
      company_address: null,
      company_city: null,
      company_zip: null,
      company_country: null,
      company_tax_id: null,
      logo_url: null,
      default_notes: null,
    })
    .eq("id", userId);

  // 9. Delete auth user (cascades profile deletion if no FK issues)
  const { error: deleteUserError } =
    await serviceClient.auth.admin.deleteUser(userId);

  if (deleteUserError) {
    return NextResponse.json(
      { error: "Account-Löschung fehlgeschlagen. Bitte kontaktiere den Support." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
