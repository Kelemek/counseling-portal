// generate-config.js
// Creates config.js from environment variables SUPABASE_URL and SUPABASE_ANON_KEY
const fs = require('fs');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
  console.error('Set them in Netlify UI (Site settings → Build & deploy → Environment).');
  process.exit(1);
}
const out = `window.SUPABASE_CONFIG = { url: '${SUPABASE_URL}', anonKey: '${SUPABASE_ANON_KEY}' };`;
fs.writeFileSync('config.js', out);
console.log('config.js generated');
