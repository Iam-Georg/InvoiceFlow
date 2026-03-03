# Feature Roadmap Phase 1: Kernwert steigern — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Custom PDF Template Builder, Recurring Invoices Backend, and DATEV Export to the Faktura invoicing tool for freelancers.

**Architecture:** Supabase tables for `invoice_templates` and `recurring_schedules`. Template builder as a new dashboard page with live PDF preview. Recurring invoices via a cron endpoint mirroring the existing `check-overdue` pattern. DATEV export extends the existing tax export API. All features plan-gated using the existing `usePlan()`/`hasPlan()` system.

**Tech Stack:** Next.js App Router, Supabase (Postgres + Storage), @react-pdf/renderer, TypeScript, CSS variables (no Tailwind classes — inline styles + globals.css)

---

## Task 1: Database Setup — Create Supabase Tables

**Files:**
- Create: `src/lib/migrations/001-invoice-templates.sql`
- Create: `src/lib/migrations/002-recurring-schedules.sql`

**Step 1: Create invoice_templates migration file**

```sql
-- 001-invoice-templates.sql
-- Run this in Supabase SQL Editor

create table if not exists public.invoice_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Meine Vorlage',
  is_default boolean not null default false,
  config jsonb not null default '{
    "colors": {"primary": "#1B3A6B", "secondary": "#6B7A90", "accent": "#2563eb"},
    "font": "Helvetica",
    "logoUrl": null,
    "layout": "classic",
    "showTaxId": true,
    "showPaymentInfo": true,
    "footerText": "Vielen Dank für Ihr Vertrauen!",
    "headerStyle": "split"
  }'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS policies
alter table public.invoice_templates enable row level security;

create policy "Users can view own templates"
  on public.invoice_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.invoice_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.invoice_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.invoice_templates for delete
  using (auth.uid() = user_id);

-- Ensure only one default per user
create or replace function public.ensure_single_default_template()
returns trigger as $$
begin
  if NEW.is_default = true then
    update public.invoice_templates
    set is_default = false
    where user_id = NEW.user_id and id != NEW.id and is_default = true;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_single_default_template
  before insert or update on public.invoice_templates
  for each row execute function public.ensure_single_default_template();
```

**Step 2: Create recurring_schedules migration file**

```sql
-- 002-recurring-schedules.sql
-- Run this in Supabase SQL Editor

create table if not exists public.recurring_schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  template_invoice_id uuid references public.invoices(id) on delete set null,
  interval text not null check (interval in ('monthly', 'quarterly', 'yearly')),
  next_run_date date not null,
  active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.recurring_schedules enable row level security;

create policy "Users can view own schedules"
  on public.recurring_schedules for select
  using (auth.uid() = user_id);

create policy "Users can insert own schedules"
  on public.recurring_schedules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own schedules"
  on public.recurring_schedules for update
  using (auth.uid() = user_id);

create policy "Users can delete own schedules"
  on public.recurring_schedules for delete
  using (auth.uid() = user_id);
```

**Step 3: Run both migrations in Supabase SQL Editor**

These are reference files only — they must be executed manually in the Supabase dashboard or via `supabase db push`. The files serve as documentation.

**Step 4: Add template_id column to invoices table**

```sql
-- Add to invoices table to link invoice to template used
alter table public.invoices add column if not exists template_id uuid references public.invoice_templates(id) on delete set null;
```

**Step 5: Commit**

```bash
git add src/lib/migrations/
git commit -m "feat: add SQL migrations for invoice_templates and recurring_schedules"
```

---

## Task 2: TypeScript Types — Add Template and Schedule Types

**Files:**
- Modify: `src/types/index.ts` (74 lines currently)

**Step 1: Add new types to the types file**

Add after the existing types (after line ~74):

```ts
/* ── Template Builder ─────────────────────────────── */

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface TemplateConfig {
  colors: TemplateColors;
  font: "Helvetica" | "Courier" | "Times-Roman";
  logoUrl: string | null;
  layout: "classic" | "modern" | "minimal";
  showTaxId: boolean;
  showPaymentInfo: boolean;
  footerText: string;
  headerStyle: "full-width" | "split" | "centered";
}

export interface InvoiceTemplate {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  config: TemplateConfig;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  colors: { primary: "#1B3A6B", secondary: "#6B7A90", accent: "#2563eb" },
  font: "Helvetica",
  logoUrl: null,
  layout: "classic",
  showTaxId: true,
  showPaymentInfo: true,
  footerText: "Vielen Dank für Ihr Vertrauen!",
  headerStyle: "split",
};

/* ── Recurring Schedules ──────────────────────────── */

export type RecurringInterval = "monthly" | "quarterly" | "yearly";

export interface RecurringSchedule {
  id: string;
  user_id: string;
  customer_id: string;
  template_invoice_id: string | null;
  interval: RecurringInterval;
  next_run_date: string;
  active: boolean;
  created_at: string;
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for templates and recurring schedules"
```

---

## Task 3: Refactor InvoicePDF — Accept TemplateConfig

**Files:**
- Modify: `src/components/invoices/InvoicePDF.tsx` (411 lines)

This is the most critical refactor. The existing hardcoded colors/styles need to become dynamic based on `TemplateConfig`.

**Step 1: Update Props interface to accept optional templateConfig**

At line 240, change the Props interface:

```tsx
import { Invoice, TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from "@/types";

interface Props {
  invoice: Invoice & {
    customer?: {
      name?: string;
      company?: string;
      address?: string;
      zip?: string;
      city?: string;
      email?: string;
    } | null;
  };
  profile: {
    full_name?: string;
    company_name?: string;
    company_address?: string;
    company_city?: string;
    company_zip?: string;
    company_tax_id?: string;
    email: string;
  };
  templateConfig?: TemplateConfig;
}
```

**Step 2: Convert static StyleSheet to a factory function**

Replace the static `StyleSheet.create({...})` (lines 4-227) with a function that takes config:

```tsx
function createStyles(config: TemplateConfig) {
  const { colors, font } = config;
  const fontFamily = font;
  const fontBold = font === "Courier" ? "Courier-Bold"
    : font === "Times-Roman" ? "Times-Bold"
    : "Helvetica-Bold";

  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: 9,
      padding: "40px 48px",
      backgroundColor: "#FFFFFF",
      color: "#0A0F1E",
    },
    // ... all existing styles, but replace:
    // - "#1B3A6B" → colors.primary
    // - "#6B7A90" → colors.secondary
    // - "Helvetica-Bold" → fontBold
    // - "Helvetica" → fontFamily
    // Keep all layout/spacing identical
    // ...
  });
}
```

Key color replacements:
- `logoBox.backgroundColor`: `#1B3A6B` → `colors.primary`
- `invoiceLabel.color`: `#1B3A6B` → `colors.primary`
- `tableHeader.backgroundColor`: `#F0F2F5` → keep as-is (neutral)
- `totalFinalRow.backgroundColor`: `#1B3A6B` → `colors.primary`
- `totalFinalLabel/Value.color`: `#FFFFFF` → keep white (on primary bg)
- `header.borderBottomColor`: `#DDE2EA` → keep neutral
- `footerBrand.color`: `#1B3A6B` → `colors.primary`

**Step 3: Update the component function**

```tsx
export default function InvoicePDF({ invoice, profile, templateConfig }: Props) {
  const config = templateConfig ?? DEFAULT_TEMPLATE_CONFIG;
  const styles = createStyles(config);

  // Rest of the render stays identical, just uses dynamic `styles`
  // Add footer text from config:
  // Replace hardcoded "Vielen Dank für Ihren Auftrag." with config.footerText

  // Conditionally show tax ID based on config.showTaxId:
  // {config.showTaxId && profile.company_tax_id && <Text>St.-Nr.: ...</Text>}
```

**Step 4: Handle layout variants**

For layout `"classic"` — keep current layout (header split left/right).
For layout `"modern"` — full-width header with logo centered, meta below.
For layout `"minimal"` — no logo box, just text, more whitespace.

Implement as conditional blocks in the render:

```tsx
{config.layout === "classic" && (
  <View style={styles.header}>
    {/* existing split layout */}
  </View>
)}
{config.layout === "modern" && (
  <View style={styles.headerModern}>
    {/* centered logo, company name large, meta below */}
  </View>
)}
{config.layout === "minimal" && (
  <View style={styles.headerMinimal}>
    {/* text only, no logo box */}
  </View>
)}
```

**Step 5: Handle logo from URL**

```tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// In header, replace the "F" logo box:
{config.logoUrl ? (
  <Image src={config.logoUrl} style={{ width: 40, height: 40, objectFit: "contain" }} />
) : (
  <View style={styles.logoBox}>
    <Text style={styles.logoLetter}>F</Text>
  </View>
)}
```

**Step 6: Verify existing usage still works**

Since `templateConfig` is optional with a default, all existing call sites (`invoices/[id]/page.tsx` line 340 and `api/invoices/[id]/send/route.ts` line 102) will continue working without changes.

**Step 7: Commit**

```bash
git add src/components/invoices/InvoicePDF.tsx
git commit -m "refactor: InvoicePDF accepts dynamic TemplateConfig for colors, fonts, layouts"
```

---

## Task 4: Template Editor Page — Build the UI

**Files:**
- Create: `src/app/(dashboard)/invoices/templates/page.tsx`
- Create: `src/app/(dashboard)/invoices/templates/[id]/page.tsx`

**Step 1: Create the template list page**

`src/app/(dashboard)/invoices/templates/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { InvoiceTemplate, DEFAULT_TEMPLATE_CONFIG } from "@/types";
import { Plus, FileText, Star, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();
  const { can, loading: planLoading } = usePlan();

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  // Load templates on mount
  useEffect(() => { /* fetch from supabase */ }, []);

  // Plan limits: Free=1, Starter=3, Professional+=unlimited
  const maxTemplates = !can("starter") ? 1 : !can("professional") ? 3 : Infinity;
  const canCreate = templates.length < maxTemplates;

  async function handleCreate() {
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const { data, error } = await sb.from("invoice_templates").insert({
      user_id: user.id,
      name: `Vorlage ${templates.length + 1}`,
      is_default: templates.length === 0,
      config: DEFAULT_TEMPLATE_CONFIG,
    }).select().single();

    if (error) { toast.error("Fehler beim Erstellen"); return; }
    router.push(`/invoices/templates/${data.id}`);
  }

  async function handleDelete(id: string) { /* delete from supabase */ }
  async function handleSetDefault(id: string) { /* update is_default */ }

  // Render: Grid of template cards with name, preview thumbnail, actions
  // Each card links to /invoices/templates/[id] for editing
}
```

**Step 2: Create the template editor page**

`src/app/(dashboard)/invoices/templates/[id]/page.tsx`:

This is the main editor with a split view:
- **Left panel (40%):** Form controls — name, colors (3 color inputs), font select, layout select, header style, footer text, showTaxId toggle, logo upload
- **Right panel (60%):** Live PDF preview using `BlobProvider` from `@react-pdf/renderer`

```tsx
"use client";

import { useState, useEffect, useRef, use } from "react";
import { createClient } from "@/lib/supabase";
import { BlobProvider } from "@react-pdf/renderer";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import { InvoiceTemplate, TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from "@/types";
import { ArrowLeft, Save, Upload, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Sample invoice data for preview
const PREVIEW_INVOICE = {
  id: "preview",
  invoice_number: "RE-2026-0042",
  status: "sent",
  issue_date: "2026-03-03",
  due_date: "2026-03-17",
  items: [
    { id: "1", description: "Webdesign & Entwicklung", quantity: 40, unit_price: 95, total: 3800 },
    { id: "2", description: "SEO Optimierung", quantity: 1, unit_price: 450, total: 450 },
    { id: "3", description: "Hosting (12 Monate)", quantity: 12, unit_price: 9.99, total: 119.88 },
  ],
  subtotal: 4369.88,
  tax_rate: 19,
  tax_amount: 830.28,
  total: 5200.16,
  notes: "Zahlbar innerhalb von 14 Tagen.",
  customer: {
    name: "Max Mustermann",
    company: "Mustermann GmbH",
    address: "Musterstraße 123",
    zip: "10115",
    city: "Berlin",
    email: "max@mustermann.de",
  },
};

const PREVIEW_PROFILE = {
  full_name: "Anna Schmidt",
  company_name: "Schmidt Design Studio",
  company_address: "Kreativweg 7",
  company_city: "München",
  company_zip: "80331",
  company_tax_id: "DE123456789",
  email: "anna@schmidt-design.de",
};

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load template on mount, set config + name from DB

  function updateConfig(partial: Partial<TemplateConfig>) {
    setConfig(prev => ({ ...prev, ...partial }));
  }

  function updateColors(partial: Partial<TemplateConfig["colors"]>) {
    setConfig(prev => ({ ...prev, colors: { ...prev.colors, ...partial } }));
  }

  async function handleSave() {
    // Update template in Supabase with { name, config, updated_at: new Date().toISOString() }
  }

  async function handleLogoUpload(file: File) {
    // Upload to Supabase Storage bucket "logos"
    // Get public URL
    // updateConfig({ logoUrl: publicUrl })
  }

  // Render split view:
  // Left: controls form
  // Right: <BlobProvider document={<InvoicePDF invoice={PREVIEW_INVOICE} profile={PREVIEW_PROFILE} templateConfig={config} />}>
  //          {({ url }) => url && <iframe src={url} style={{ width: "100%", height: "100%" }} />}
  //        </BlobProvider>
}
```

**Step 3: The editor form controls include:**

- **Name:** Text input
- **Primärfarbe:** `<input type="color">` bound to `config.colors.primary`
- **Sekundärfarbe:** `<input type="color">` bound to `config.colors.secondary`
- **Akzentfarbe:** `<input type="color">` bound to `config.colors.accent`
- **Schriftart:** `<select>` with Helvetica / Courier / Times-Roman
- **Layout:** 3 clickable cards (Classic / Modern / Minimal) with visual preview
- **Header-Stil:** `<select>` with full-width / split / centered
- **Fußzeile:** `<textarea>` for footer text
- **Steuernummer anzeigen:** `<input type="checkbox">`
- **Logo hochladen:** File input + preview thumbnail, upload to Supabase Storage

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/invoices/templates/
git commit -m "feat: add template list and editor pages with live PDF preview"
```

---

## Task 5: Supabase Storage — Logo Upload

**Files:**
- Create: `src/app/api/templates/upload-logo/route.ts`

**Step 1: Create the upload API route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Validate: max 2MB, image only
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(path, file, { upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
```

**Note:** The `logos` bucket must be created in Supabase dashboard with public access enabled. Add this to the migration docs.

**Step 2: Commit**

```bash
git add src/app/api/templates/upload-logo/route.ts
git commit -m "feat: add logo upload API route for invoice templates"
```

---

## Task 6: Template Selection in Invoice Creation

**Files:**
- Modify: `src/app/(dashboard)/invoices/new/page.tsx` (721 lines)
- Modify: `src/app/(dashboard)/invoices/[id]/page.tsx` (963 lines)

**Step 1: Add template selector to invoice creation form**

In `invoices/new/page.tsx`, add state and UI:

```tsx
// New state (add near line 30-52):
const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

// Load templates in the data-fetching useEffect:
const { data: tplData } = await sb.from("invoice_templates")
  .select("*")
  .eq("user_id", user.id)
  .order("is_default", { ascending: false });
if (tplData) {
  setTemplates(tplData);
  const def = tplData.find(t => t.is_default);
  if (def) setSelectedTemplateId(def.id);
}

// Add to the "Rechnungsdetails" card grid (after due date, before items):
<div>
  <label>Vorlage</label>
  <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
    <option value="">Standard</option>
    {templates.map(t => (
      <option key={t.id} value={t.id}>{t.name}{t.is_default ? " (Standard)" : ""}</option>
    ))}
  </select>
</div>
```

**Step 2: Save template_id with invoice**

In `handleSave` (line ~104-156), add `template_id: selectedTemplateId || null` to the insert object.

**Step 3: Load template in invoice detail page**

In `invoices/[id]/page.tsx`, after loading the invoice, also load the template if `invoice.template_id` exists:

```tsx
// After invoice load:
let templateConfig = undefined;
if (inv.template_id) {
  const { data: tpl } = await sb.from("invoice_templates")
    .select("config").eq("id", inv.template_id).single();
  if (tpl) templateConfig = tpl.config;
}

// Pass to PDF:
<InvoicePDF invoice={invoice} profile={profile} templateConfig={templateConfig} />
```

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/invoices/new/page.tsx src/app/\(dashboard\)/invoices/\[id\]/page.tsx
git commit -m "feat: template selection in invoice creation and detail view"
```

---

## Task 7: Sidebar Navigation — Add Vorlagen Link

**Files:**
- Modify: `src/components/layout/Sidebar.tsx` (263 lines, line 18-26)

**Step 1: Add "Vorlagen" nav item**

Insert after the "Rechnungen" item (line 20):

```tsx
const navItems = [
  { href: "/dashboard",           label: "Übersicht",     icon: LayoutGrid },
  { href: "/invoices",            label: "Rechnungen",    icon: FileText },
  { href: "/invoices/templates",  label: "Vorlagen",      icon: Palette },
  { href: "/customers",           label: "Kunden",        icon: Users },
  { href: "/statistics",          label: "Statistiken",   icon: BarChart3 },
  { href: "/settings",            label: "Einstellungen", icon: Settings },
  { href: "/billing",             label: "Billing",       icon: CreditCard },
  { href: "/support",             label: "Support",       icon: HelpCircle },
];
```

Import `Palette` from lucide-react.

**Note:** The magnetic indicator height calculation uses `44px` per item. Adding one item shifts everything. Verify the indicator `top` math still works — it should, since it uses `indicatorIndex * 44`.

**Step 2: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add Vorlagen nav item to sidebar"
```

---

## Task 8: Recurring Invoices — Backend Cron

**Files:**
- Create: `src/app/api/cron/recurring-invoices/route.ts`

**Step 1: Create the cron endpoint**

Follow the exact pattern from `src/app/api/cron/check-overdue/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { generateInvoiceNumber } from "@/lib/utils";

function addInterval(date: string, interval: string): string {
  const d = new Date(date);
  switch (interval) {
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split("T")[0];
}

async function runCron(req: NextRequest) {
  // 1. Auth check with CRON_SECRET (same pattern as check-overdue)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // 2. Fetch active schedules where next_run_date <= today
  const { data: schedules, error } = await supabase
    .from("recurring_schedules")
    .select("*, template:invoices(*)")
    .eq("active", true)
    .lte("next_run_date", today);

  if (error || !schedules?.length) {
    return NextResponse.json({ processed: 0 });
  }

  let created = 0;

  for (const schedule of schedules) {
    if (!schedule.template) continue;

    // 3. Get user's invoice counter
    const { data: profile } = await supabase
      .from("profiles")
      .select("invoice_counter")
      .eq("id", schedule.user_id)
      .single();

    const counter = (profile?.invoice_counter ?? 0) + 1;

    // 4. Create new invoice from template
    const { template } = schedule;
    const newIssueDate = today;
    const paymentDays = Math.round(
      (new Date(template.due_date).getTime() - new Date(template.issue_date).getTime())
      / (1000 * 60 * 60 * 24)
    );
    const newDueDate = new Date(Date.now() + paymentDays * 86400000)
      .toISOString().split("T")[0];

    const { error: insertError } = await supabase.from("invoices").insert({
      user_id: schedule.user_id,
      customer_id: schedule.customer_id,
      invoice_number: generateInvoiceNumber(counter),
      status: "draft",
      issue_date: newIssueDate,
      due_date: newDueDate,
      items: template.items,
      subtotal: template.subtotal,
      tax_rate: template.tax_rate,
      tax_amount: template.tax_amount,
      total: template.total,
      notes: template.notes,
      template_id: template.template_id,
    });

    if (insertError) continue;

    // 5. Update invoice counter
    await supabase.from("profiles")
      .update({ invoice_counter: counter })
      .eq("id", schedule.user_id);

    // 6. Update next_run_date
    const nextDate = addInterval(schedule.next_run_date, schedule.interval);
    await supabase.from("recurring_schedules")
      .update({ next_run_date: nextDate })
      .eq("id", schedule.id);

    created++;
  }

  return NextResponse.json({ processed: created, total: schedules.length });
}

export async function POST(req: NextRequest) { return runCron(req); }
export async function GET(req: NextRequest) { return runCron(req); }
```

**Step 2: Commit**

```bash
git add src/app/api/cron/recurring-invoices/route.ts
git commit -m "feat: add recurring invoices cron endpoint"
```

---

## Task 9: Recurring Invoices — Connect UI to Backend

**Files:**
- Modify: `src/app/(dashboard)/invoices/new/page.tsx`

**Step 1: Create recurring schedule after invoice save**

In `handleSave` (line ~104-156), after the invoice is successfully created and we have the invoice ID, if `recurring` is set:

```tsx
// After successful invoice insert, if recurring was selected:
if (recurring && data?.id) {
  const nextDate = new Date();
  switch (recurring) {
    case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
    case "quarterly": nextDate.setMonth(nextDate.getMonth() + 3); break;
    case "yearly": nextDate.setFullYear(nextDate.getFullYear() + 1); break;
  }

  await sb.from("recurring_schedules").insert({
    user_id: user.id,
    customer_id: customerId,
    template_invoice_id: data.id,
    interval: recurring,
    next_run_date: nextDate.toISOString().split("T")[0],
    active: true,
  });
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/invoices/new/page.tsx
git commit -m "feat: connect recurring invoice UI to backend schedule creation"
```

---

## Task 10: DATEV Export

**Files:**
- Modify: `src/app/api/export/tax/route.ts` (94 lines)
- Modify: `src/app/(dashboard)/settings/page.tsx` (440 lines)

**Step 1: Add DATEV format to the tax export API**

In `route.ts`, check for `?format=datev` query parameter:

```ts
const format = req.nextUrl.searchParams.get("format") || "standard";

if (format === "datev") {
  // DATEV Buchungsstapel header
  const datevHeader = [
    '"EXTF"',  // Format identifier
    '700',     // Version
    '21',      // Data category (Buchungsstapel)
    '"Buchungsstapel"',
    '12',      // Format version
    `"${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}"`, // Created
    '""',      // Reserved
    '"SK"',    // Source identifier
    '""', '""', // Reserved
    `${year}0101`, // Fiscal year start
    '4',       // Account length
    `${year}0101`, // Period start
    `${year}1231`, // Period end
    '""', '""', '""', // Reserved
  ].join(";");

  // Column headers
  const datevColumns = [
    "Umsatz (ohne Soll/Haben-Kz)",
    "Soll/Haben-Kennzeichen",
    "WKZ Umsatz",
    "Konto",
    "Gegenkonto (ohne BU-Schlüssel)",
    "Belegdatum",
    "Buchungstext",
    "Belegfeld 1",
  ].join(";");

  // Data rows
  const datevRows = invoices.map(inv => {
    const issueDate = new Date(inv.issue_date);
    const belegdatum = `${String(issueDate.getDate()).padStart(2, "0")}${String(issueDate.getMonth() + 1).padStart(2, "0")}`;
    return [
      inv.total.toFixed(2).replace(".", ","), // German decimal
      "S",                                     // Soll
      "EUR",
      "10000",                                 // Debitor account (standard)
      inv.tax_rate === 19 ? "8400" : inv.tax_rate === 7 ? "8300" : "8000", // Erlöskonto
      belegdatum,
      `"${(inv.invoice_number || "").replace(/"/g, '""')}"`,
      `"${(inv.invoice_number || "").replace(/"/g, '""')}"`,
    ].join(";");
  });

  const csv = [datevHeader, datevColumns, ...datevRows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=windows-1252",
      "Content-Disposition": `attachment; filename="EXTF_Buchungsstapel_${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
```

**Step 2: Add DATEV option to Settings page**

In `settings/page.tsx` at the Steuerexport section (line ~373-435), add a format selector:

```tsx
const [exportFormat, setExportFormat] = useState("standard");

// Add before the download button:
<div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
    <input type="radio" name="format" value="standard" checked={exportFormat === "standard"}
      onChange={() => setExportFormat("standard")} />
    Standard CSV
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
    <input type="radio" name="format" value="datev" checked={exportFormat === "datev"}
      onChange={() => setExportFormat("datev")} />
    DATEV-Format
  </label>
</div>

// Update the fetch URL:
const response = await fetch(`/api/export/tax?year=${encodeURIComponent(exportYear)}&format=${exportFormat}`);
```

**Step 3: Commit**

```bash
git add src/app/api/export/tax/route.ts src/app/\(dashboard\)/settings/page.tsx
git commit -m "feat: add DATEV export format for tax data"
```

---

## Task 11: Update Plans — Add Template Feature Gate

**Files:**
- Modify: `src/lib/plans.ts` (111 lines)

**Step 1: Add `invoiceTemplates` to PlanFeatures**

```ts
// In PlanFeatures interface, add:
invoiceTemplates: number;  // max number of templates (Infinity for unlimited)

// In PLAN_FEATURES, add to each plan:
free:         { ..., invoiceTemplates: 1 },
starter:      { ..., invoiceTemplates: 3 },
professional: { ..., invoiceTemplates: Infinity },
business:     { ..., invoiceTemplates: Infinity },
```

**Step 2: Commit**

```bash
git add src/lib/plans.ts
git commit -m "feat: add invoiceTemplates limit to plan features"
```

---

## Task 12: Update Funktionen Page — New Feature Cards

**Files:**
- Modify: `src/app/funktionen/page.tsx` (271 lines, FEATURES array at line 23-78)

**Step 1: Add new features to the FEATURES array**

```tsx
// Add to FEATURES array:
{ Icon: Palette,  title: "Rechnungsvorlagen",      description: "Gestalten Sie eigene Rechnungsvorlagen mit individuellen Farben, Logo und Schriftarten. Live-Vorschau beim Bearbeiten." },
{ Icon: Repeat,   title: "Wiederkehrende Rechnungen", description: "Automatische Rechnungserstellung für Retainer und Abonnements. Monatlich, vierteljährlich oder jährlich." },
{ Icon: Database,  title: "DATEV-Export",            description: "Exportieren Sie Ihre Rechnungsdaten im DATEV-Buchungsstapel-Format für Ihren Steuerberater." },
```

Import `Palette`, `Repeat`, `Database` from lucide-react.

**Step 2: Commit**

```bash
git add src/app/funktionen/page.tsx
git commit -m "feat: add template builder, recurring, DATEV to features page"
```

---

## Task 13: Update Email Send Route — Use Template

**Files:**
- Modify: `src/app/api/invoices/[id]/send/route.ts` (143 lines)

**Step 1: Load template config when sending PDF by email**

After loading the invoice (line ~36-41), also load the template if the invoice has `template_id`:

```ts
let templateConfig = undefined;
if (invoice.template_id) {
  const { data: tpl } = await supabase
    .from("invoice_templates")
    .select("config")
    .eq("id", invoice.template_id)
    .single();
  if (tpl) templateConfig = tpl.config;
}

// At line 102-109 where PDF is created, pass templateConfig:
const pdfDocument = React.createElement(InvoicePDF, {
  invoice: invoice as Parameters<typeof InvoicePDF>[0]["invoice"],
  profile: { ...(profile ?? {}), email: profile?.email || user.email || "" },
  templateConfig,
}) as unknown as React.ReactElement<DocumentProps>;
```

**Step 2: Commit**

```bash
git add src/app/api/invoices/\[id\]/send/route.ts
git commit -m "feat: use invoice template config when sending PDF via email"
```

---

## Task 14: Final Polish and Integration Testing

**Step 1: Test the full template flow**
- Create a template with custom colors
- Create an invoice using that template
- Verify PDF download shows custom colors
- Verify email send uses custom template

**Step 2: Test recurring invoices**
- Create an invoice with recurring=monthly
- Verify recurring_schedules row was created
- Hit the cron endpoint manually: `curl -X POST /api/cron/recurring-invoices`
- Verify new invoice was created

**Step 3: Test DATEV export**
- Go to Settings → Steuerexport → Select DATEV format → Download
- Verify CSV has DATEV header and correct columns

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 complete — template builder, recurring invoices, DATEV export"
```

---

## Summary of All New Files

| File | Purpose |
|---|---|
| `src/lib/migrations/001-invoice-templates.sql` | DB migration |
| `src/lib/migrations/002-recurring-schedules.sql` | DB migration |
| `src/app/(dashboard)/invoices/templates/page.tsx` | Template list page |
| `src/app/(dashboard)/invoices/templates/[id]/page.tsx` | Template editor |
| `src/app/api/templates/upload-logo/route.ts` | Logo upload API |
| `src/app/api/cron/recurring-invoices/route.ts` | Recurring cron |

## Summary of Modified Files

| File | Change |
|---|---|
| `src/types/index.ts` | Add TemplateConfig, InvoiceTemplate, RecurringSchedule types |
| `src/components/invoices/InvoicePDF.tsx` | Accept templateConfig, dynamic styles |
| `src/app/(dashboard)/invoices/new/page.tsx` | Template selector, recurring backend |
| `src/app/(dashboard)/invoices/[id]/page.tsx` | Load template for PDF |
| `src/app/api/invoices/[id]/send/route.ts` | Pass template to PDF |
| `src/components/layout/Sidebar.tsx` | Add Vorlagen nav item |
| `src/app/funktionen/page.tsx` | New feature cards |
| `src/lib/plans.ts` | Add invoiceTemplates limit |
| `src/app/api/export/tax/route.ts` | Add DATEV format |
| `src/app/(dashboard)/settings/page.tsx` | DATEV format selector |
