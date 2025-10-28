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
      
      // Parse JotForm data - use parsed field if available, otherwise use raw data
      const dataToDisplay = r.parsed || r.data;
      const cleanData = parseJotFormData(dataToDisplay);
      
      const dataDiv = document.createElement('div');
      dataDiv.style.marginTop = '8px';
      
      if (Object.keys(cleanData).length > 0) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        for (const [key, value] of Object.entries(cleanData)) {
          const tr = document.createElement('tr');
          const tdKey = document.createElement('td');
          tdKey.style.padding = '4px 8px';
          tdKey.style.fontWeight = 'bold';
          tdKey.style.verticalAlign = 'top';
          tdKey.style.width = '200px';
          tdKey.textContent = key;
          const tdVal = document.createElement('td');
          tdVal.style.padding = '4px 8px';
          tdVal.textContent = value;
          tr.appendChild(tdKey);
          tr.appendChild(tdVal);
          table.appendChild(tr);
        }
        dataDiv.appendChild(table);
      }
      
      // Show raw data in collapsible section
      const detailsEl = document.createElement('details');
      detailsEl.style.marginTop = '8px';
      const summaryEl = document.createElement('summary');
      summaryEl.textContent = 'Show raw data';
      summaryEl.style.cursor = 'pointer';
      summaryEl.style.color = '#666';
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(r, null, 2);
      detailsEl.appendChild(summaryEl);
      detailsEl.appendChild(pre);
      
      row.appendChild(meta);
      row.appendChild(dataDiv);
      row.appendChild(detailsEl);
      listEl.appendChild(row);
    });
  }

  function parseJotFormData(data) {
    const clean = {};
    
    // JotForm typically sends data like: { "q3_firstName": "John", "q4_lastName": "Doe" }
    // or { "q10_name": {"first": "John", "last": "Doe"} }
    // We want to extract readable field names
    for (const [key, value] of Object.entries(data)) {
      // Skip system/technical fields
      if ([
        'formID', 'submissionID', 'id', 'event', 'rawRequest', 'slug',
        'jsExecutionTracker', 'submitSource', 'submitDate', 'buildDate',
        'uploadServerUrl', 'eventObserver', 'event_id', 'timeToSubmit',
        'validatedNewRequiredFieldIDs', 'path', 'webhookURL', 'username',
        'type', 'customParams', 'product', 'formTitle', 'customTitle',
        'documentID', 'teamID', 'subject', 'isSilent', 'customBody',
        'fromTable', 'appID', 'unread', 'parent', 'ip', 'pretty'
      ].includes(key)) {
        continue;
      }
      
      // Extract field name from keys like "q3_firstName" -> "First Name"
      let cleanKey = key;
      
      // Remove question number prefix (q1_, q2_, etc.)
      cleanKey = cleanKey.replace(/^q\d+_/, '');
      
      // Remove trailing numbers (like email11, phoneNumber12)
      cleanKey = cleanKey.replace(/\d+$/, '');
      
      // Convert camelCase to Title Case
      cleanKey = cleanKey.replace(/([A-Z])/g, ' $1').trim();
      cleanKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
      
      // Handle nested objects (like name fields with first/last)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if it's a phone number object
        if (value.area && value.phone) {
          clean[cleanKey] = `(${value.area}) ${value.phone}`;
        } else {
          // Handle other nested objects
          for (const [subKey, subValue] of Object.entries(value)) {
            if (subValue && String(subValue).trim()) {
              const subCleanKey = subKey.charAt(0).toUpperCase() + subKey.slice(1);
              clean[`${cleanKey} - ${subCleanKey}`] = String(subValue);
            }
          }
        }
      } else if (Array.isArray(value)) {
        clean[cleanKey] = value.join(', ');
      } else if (value && String(value).trim()) {
        clean[cleanKey] = String(value);
      }
    }
    
    return clean;
  }

  function escapeHtml(s) {
    return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  refreshBtn.addEventListener('click', fetchSubmissions);
  filterInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchSubmissions(); });

  // initial load
  fetchSubmissions();
})();
