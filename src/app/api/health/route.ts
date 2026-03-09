import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const start = Date.now();

  try {
    const supabase = createServiceSupabaseClient();
    const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" });

    if (error) {
      return NextResponse.json(
        { status: "unhealthy", db: "error", error: error.message, latency_ms: Date.now() - start },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "healthy",
      db: "connected",
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", db: "unreachable", latency_ms: Date.now() - start },
      { status: 503 },
    );
  }
}
