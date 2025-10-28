// Supabase Edge Function (Deno + TypeScript)
// Deno-friendly imports are used so the file can be run in the Supabase Edge runtime.
// Set environment variables in the Supabase Function settings:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JOTFORM_WEBHOOK_SECRET

// Minimal Edge Function using fetch to call Supabase REST (no supabase-js)
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
// Support multiple possible secret names: prefer explicit SUPABASE_SERVICE_ROLE_KEY,
// but fall back to SERVICE_ROLE_KEY or SERVICE_KEY if Supabase CLI/dashboard naming differs.
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_KEY") || "";
const JOTFORM_WEBHOOK_SECRET = Deno.env.get("JOTFORM_WEBHOOK_SECRET") || "";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    
    // Debug route to show what JOTFORM_WEBHOOK_SECRET and SERVICE_KEY the function actually sees (masked)
    // Check this BEFORE secret verification for debugging
    if (url.searchParams.get('debug2') === '1') {
      const jotMasked = JOTFORM_WEBHOOK_SECRET ? String(JOTFORM_WEBHOOK_SECRET).slice(0,8) + '...' : 'none';
      const svcMasked = SERVICE_KEY ? String(SERVICE_KEY).slice(0,6) + '...' : 'none';
      return new Response(JSON.stringify({ debug: true, jotform_env_masked: jotMasked, service_key_masked: svcMasked }), { status: 200 });
    }
    
    // Support secret in URL path (e.g. /jotform-webhook/SECRET) or query param (?secret=SECRET) or header
    const pathParts = url.pathname.split('/').filter(p => p);
    const pathSecret = pathParts.length >= 2 ? pathParts[pathParts.length - 1] : null;
    const secret = pathSecret || url.searchParams.get("secret") || req.headers.get("x-jotform-webhook-secret");
    
    // Temporary masked logging for debugging incoming secret (remove after debug)
    try {
      const masked = secret ? `${String(secret).slice(0,8)}...` : 'none';
      console.log('incoming request url:', url.href);
      console.log('secret seen (masked):', masked);
      console.log('path parts:', pathParts);
    } catch (e) {
      // ignore logging errors
    }

    if (!secret || secret !== JOTFORM_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    let body: any;
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    }

    // Parse the rawRequest field if it exists (JotForm sends actual form data here as JSON string)
    let parsedData = body;
    if (body.rawRequest) {
      try {
        parsedData = JSON.parse(body.rawRequest);
      } catch (e) {
        console.log('Could not parse rawRequest, using body as-is');
      }
    }

    const formId = body.formID || body.form_id || body.formId || null;
    const submissionId = body.submissionID || body.id || body.submission_id || body.sid || null;
    const formTitle = body.formTitle || null;

    // Temporary masked logging to verify SERVICE_KEY is present in runtime (remove after debug)
    try {
      const svcMasked = SERVICE_KEY ? String(SERVICE_KEY).slice(0,6) + '...' : 'none';
      console.log('service_key seen (masked):', svcMasked);
    } catch (e) {
      // ignore
    }

    const payload = {
      form_id: formId,
      submission_id: submissionId,
      data: body,
      parsed: parsedData,
      files: null,
      submitted_at: body.created_at || new Date().toISOString()
    };

    // If debug param is provided, return masked info about the SERVICE_KEY and headers
    const isDebug = url.searchParams.get('debug') === '1';
    const restUrl = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/jotform_submissions`;
    if (isDebug) {
      const svcMasked = SERVICE_KEY ? String(SERVICE_KEY).slice(0,6) + '...' : 'none';
      const authMasked = SERVICE_KEY ? ('Bearer ' + String(SERVICE_KEY).slice(0,6) + '...') : 'none';
      return new Response(JSON.stringify({ status: 'debug', service_key_masked: svcMasked, restUrl, auth_header: authMasked }), { status: 200 });
    }

    // Post to PostgREST
    const res = await fetch(restUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("postgrest error:", res.status, text);
      return new Response(JSON.stringify({ error: "db error", details: text }), { status: 500 });
    }

    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  } catch (err) {
    console.error("handler error", err);
    return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
  }
});
