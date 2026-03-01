import { createClient } from "@/lib/supabase";

export type FeedbackType = "bug" | "feature" | "lob";
export type FeedbackStatus = "offen" | "in_bearbeitung" | "geloest";
export type FeedbackPriority = "niedrig" | "normal" | "hoch" | "kritisch";

export interface Feedback {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  message: string;
  page_context: string | null;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export async function createFeedback(data: {
  type: FeedbackType;
  title: string;
  message: string;
  page_context?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet");

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    type: data.type,
    title: data.title,
    message: data.message,
    page_context: data.page_context ?? null,
  });

  if (error) throw toError(error);
}

function toError(e: unknown): Error {
  if (e instanceof Error) return e;
  if (e && typeof e === "object" && "message" in e) {
    return new Error(String((e as { message: unknown }).message));
  }
  return new Error("Unbekannter Fehler");
}

export async function getMyFeedback(): Promise<Feedback[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw toError(error);
  return (data as Feedback[]) ?? [];
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw toError(error);
  return (data as Feedback[]) ?? [];
}

export async function replyToFeedback(id: string, reply: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("feedback")
    .update({
      admin_reply: reply,
      replied_at: new Date().toISOString(),
      status: "geloest" as FeedbackStatus,
    })
    .eq("id", id);

  if (error) throw toError(error);
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("feedback")
    .update({ status })
    .eq("id", id);

  if (error) throw toError(error);
}
