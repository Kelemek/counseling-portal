// Simple viewer that uses Supabase REST to list rows from jotform_submissions
(function () {
  if (!window.SUPABASE_CONFIG) {
    document.body.innerHTML = '<p style="color:red">Missing config. Generate config.js with SUPABASE_URL and SUPABASE_ANON_KEY.</p>';
    return;
  }
  const SUPABASE_URL = window.SUPABASE_CONFIG.url.replace(/\/+$/,'');
  const ANON = window.SUPABASE_CONFIG.anonKey;
  const listEl = document.getElementById('list');
  const refreshBtn = document.getElementById('refresh');
  const filterInput = document.getElementById('formFilter');

  async function fetchSubmissions() {
    listEl.innerHTML = '<p>Loading…</p>';
    const filter = filterInput.value.trim();
    let url = `${SUPABASE_URL}/rest/v1/jotform_submissions?select=*&order=created_at.desc&limit=100`;
    if (filter) {
      // simple eq filter on form_id
      url += `&form_id=eq.${encodeURIComponent(filter)}`;
    }

    const res = await fetch(url, {
      headers: {
        'apikey': ANON,
        'Authorization': `Bearer ${ANON}`
      }
    });
    if (!res.ok) {
      listEl.innerHTML = `<p style="color:red">Error fetching submissions: ${res.status} ${res.statusText}</p>`;
      return;
    }
    const data = await res.json();
    renderList(data);
  }

  function renderList(rows) {
    if (!rows || rows.length === 0) {
      listEl.innerHTML = '<p>No submissions found.</p>';
      return;
    }
    listEl.innerHTML = '';
    rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'row';
      const meta = document.createElement('div');
      meta.innerHTML = `<strong>form_id:</strong> ${escapeHtml(r.form_id || '')} <strong>submitted_at:</strong> ${escapeHtml(r.submitted_at || '')}`;
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(r.data, null, 2);
      row.appendChild(meta);
      row.appendChild(pre);
      listEl.appendChild(row);
    });
  }

  function escapeHtml(s) {
    return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  refreshBtn.addEventListener('click', fetchSubmissions);
  filterInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchSubmissions(); });

  // initial load
  fetchSubmissions();
})();
