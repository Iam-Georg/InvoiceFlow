import { z } from "zod/v4";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().optional().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email().optional().default("noreply@faktura.app"),
  GROQ_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(8),
  SENTRY_DSN: z.string().optional(),
});

function validateEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n❌ Missing or invalid environment variables:\n${missing}\n\nSee .env.example for required variables.\n`,
    );
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}

export const env = validateEnv();
