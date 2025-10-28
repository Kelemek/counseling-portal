# JotForm → Supabase → Netlify viewer

This guide explains how to wire JotForm submissions into Supabase, and host a simple Netlify site to view the submissions.

## Files added
- `sql/schema.sql` — DB schema and example RLS hints.
- `supabase-edge/jotform-webhook.ts` — Supabase Edge Function to receive JotForm webhooks and insert into the `jotform_submissions` table.
- `netlify-site/` — Minimal static viewer site and a build helper `generate-config.js` to write `config.js` from environment variables.

## Steps

1) Create the table
- Open Supabase → SQL Editor and run the SQL in `sql/schema.sql`.

2) Deploy the Edge Function (recommended)
- In Supabase, create a new Edge Function and paste `supabase-edge/jotform-webhook.ts` content.
- Set environment variables in the Supabase Function settings:
  - `SUPABASE_URL` (your Supabase URL)
  - `SUPABASE_SERVICE_ROLE_KEY` (service role key — keep private)
  - `JOTFORM_WEBHOOK_SECRET` (a secret string you will also add to the JotForm webhook URL)
- Deploy the function and copy its public URL.

3) Configure JotForm webhook
- In JotForm Form Builder → Settings → Integrations → Webhook, add the function URL.
  - Example URL: `https://<region>.functions.supabase.co/jotform-webhook?secret=MY_SECRET`
  - Use the same `MY_SECRET` value you set in `JOTFORM_WEBHOOK_SECRET`.

4) Deploy the Netlify site
- In your Netlify site settings, set the build environment variables:
  - `SUPABASE_URL` — your Supabase URL
  - `SUPABASE_ANON_KEY` — Supabase anon public key (used for read-only queries)

- In Netlify, set the build command to:

  npm run build

- The `build` script will generate `config.js` from the env vars and copy files into `public/`.

- Publish the site.

Security notes:
- Only the Edge Function uses the `SERVICE_ROLE_KEY` (server-side). Keep it secret.
- The frontend uses the `ANON` key. If you don't want public reads, enable RLS and create policies requiring authentication; then change the frontend to authenticate users.

Testing locally:
- For the viewer:
  - Set env variables locally: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  - Run `npm install` (optional) then `npm run build` then `npm start` (the project uses `serve` via npx).

- For the webhook:
  - Use the deployed Edge Function URL and run a curl POST with the secret (see next section).

## Example curl for webhook test

curl -X POST "https://<your-edge-fn-url>?secret=MY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"formID":"12345","id":"sub_1","name":"Alice","email":"a@example.com"}'

Then refresh the Netlify viewer (or query the table in Supabase SQL Editor):

select * from jotform_submissions order by created_at desc limit 10;


## Next steps / optional
- Parse and map JotForm fields into a normalized `parsed` jsonb for easier queries.
- Fetch and copy uploaded files into Supabase Storage (Edge Function can fetch file URLs and use `supabase.storage.from(...).upload(...)`).
- Add authentication to the Netlify site and require logged-in users to view submissions.
