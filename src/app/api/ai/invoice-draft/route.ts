import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";

interface DraftItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface DraftResponse {
  items: DraftItem[];
  notes?: string;
  suggested_due_days?: number;
  customer_hint?: string;
  source: "groq" | "heuristic";
}

function heuristicDraft(description: string): DraftResponse {
  const cleaned = description.trim();
  const lines = cleaned
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: DraftItem[] = [];
  for (const line of lines) {
    const match = line.match(
      /^(.*?)(?:\s+x?\s?(\d+(?:[.,]\d+)?))?(?:\s+@?\s?(\d+(?:[.,]\d+)?))?\s*(?:EUR|€)?$/i,
    );
    if (!match) continue;
    const descriptionPart = (match[1] || line).trim();
    const quantity = Number((match[2] || "1").replace(",", "."));
    const unitPrice = Number((match[3] || "0").replace(",", "."));
    items.push({
      description: descriptionPart,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unit_price: Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0,
    });
  }

  if (items.length === 0) {
    items.push({
      description: cleaned || "Leistung laut Projektbeschreibung",
      quantity: 1,
      unit_price: 0,
    });
  }

  return {
    items,
    suggested_due_days: 14,
    notes:
      "Vielen Dank fuer Ihren Auftrag. Zahlbar innerhalb von 14 Tagen ohne Abzug.",
    source: "heuristic",
  };
}

async function groqDraft(description: string): Promise<DraftResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Assistent fuer deutsche Rechnungen. Antworte ausschliesslich mit validem JSON ohne Markdown.",
        },
        {
          role: "user",
          content: `Erzeuge aus dieser Projektbeschreibung eine Rechnungsstruktur. Gib exakt dieses JSON-Format aus: {"customer_hint":string(optional),"suggested_due_days":number(optional),"notes":string(optional),"items":[{"description":string,"quantity":number,"unit_price":number}]}. Projektbeschreibung: ${description}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as Omit<DraftResponse, "source">;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    const items = parsed.items
      .map((item) => ({
        description: String(item.description ?? "").trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      }))
      .filter(
        (item) =>
          item.description.length > 0 &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          Number.isFinite(item.unit_price) &&
          item.unit_price >= 0,
      );
    if (items.length === 0) return null;

    return {
      ...parsed,
      items,
      source: "groq",
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { description } = (await req.json()) as { description?: string };
  if (!description || !description.trim()) {
    return NextResponse.json(
      { error: "Beschreibung fehlt." },
      { status: 400 },
    );
  }

  const groq = await groqDraft(description.trim());
  if (groq) {
    return NextResponse.json(groq);
  }

  return NextResponse.json(heuristicDraft(description));
}
