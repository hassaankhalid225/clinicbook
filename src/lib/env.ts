/**
 * Centralized environment access. Keeps `process.env` reads in one place so
 * missing variables surface as clear errors instead of silent `undefined`.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  // Supabase (public — safe in the browser)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",

  // Server-only
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },

  // Integrations (optional — features degrade gracefully when unset)
  twilio: {
    accountSid: optional("TWILIO_ACCOUNT_SID"),
    authToken: optional("TWILIO_AUTH_TOKEN"),
    fromNumber: optional("TWILIO_FROM_NUMBER"),
  },
  resend: {
    apiKey: optional("RESEND_API_KEY"),
    from: process.env.EMAIL_FROM ?? "ClinicBook <noreply@clinicbook.io>",
  },

  isProd: process.env.NODE_ENV === "production",
} as const;

/** True when Supabase public env vars are configured. */
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);
