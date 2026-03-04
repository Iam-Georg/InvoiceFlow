import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 2MB)" },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only images allowed" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(path, file, { upsert: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
