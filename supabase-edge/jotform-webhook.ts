// Supabase Edge Function (Deno + TypeScript)
// Deno-friendly imports are used so the file can be run in the Supabase Edge runtime.
// Set environment variables in the Supabase Function settings:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JOTFORM_WEBHOOK_SECRET

// Use explicit URL imports compatible with Deno. These avoid local editor complaints about
// missing Node modules when this file is run in the Supabase Edge environment.
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
// Import supabase-js via a CDN that provides an ESM build for Deno. The `?no-check` flag
// silences type errors coming from the CDN bundle in some environments.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0?no-check";

// Provide a minimal Deno declaration so TypeScript in editors won't complain locally.
declare const Deno: {
  env: { get(key: string): string | undefined };
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const JOTFORM_WEBHOOK_SECRET = Deno.env.get("JOTFORM_WEBHOOK_SECRET") || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret") || req.headers.get("x-jotform-webhook-secret");
    if (!secret || secret !== JOTFORM_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
    }

    // Normalize a few common fields. JotForm payload shapes vary; inspect your actual payload if needed.
    const formId = body.formID || body.form_id || body.formId || null;
    const submissionId = body.id || body.submission_id || body.sid || null;

    const payload = {
      form_id: formId,
      submission_id: submissionId,
      data: body,
      parsed: null,
      files: null,
      submitted_at: body.created_at || new Date().toISOString()
    };

    // Upsert to avoid duplicate inserts if JotForm retries delivery. Requires a unique
    // constraint on submission_id (you can create this in SQL if you want dedupe):
    // ALTER TABLE jotform_submissions ADD CONSTRAINT uq_submission_id UNIQUE (submission_id);
    const { error } = await supabase.from('jotform_submissions').upsert(payload, { onConflict: 'submission_id' });
    if (error) {
      console.error('supabase insert/upsert error', error);
      return new Response(JSON.stringify({ error: 'db error' }), { status: 500 });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  } catch (err) {
    console.error('handler error', err);
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 });
  }
});
