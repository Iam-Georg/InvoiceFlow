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
  source: "openai" | "heuristic";
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

async function openAiDraft(description: string): Promise<DraftResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Du bist ein Assistent fuer deutsche Rechnungen. Antworte nur als JSON ohne Markdown.",
        },
        {
          role: "user",
          content: `Erzeuge aus dieser Projektbeschreibung eine Rechnungsstruktur: ${description}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "invoice_draft",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              customer_hint: { type: "string" },
              suggested_due_days: { type: "number" },
              notes: { type: "string" },
              items: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    description: { type: "string" },
                    quantity: { type: "number" },
                    unit_price: { type: "number" },
                  },
                  required: ["description", "quantity", "unit_price"],
                },
              },
            },
            required: ["items"],
          },
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    output_text?: string;
  };
  if (!data.output_text) return null;

  try {
    const parsed = JSON.parse(data.output_text) as Omit<DraftResponse, "source">;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    return { ...parsed, source: "openai" };
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

  const openAi = await openAiDraft(description.trim());
  if (openAi) {
    return NextResponse.json(openAi);
  }

  return NextResponse.json(heuristicDraft(description));
}
