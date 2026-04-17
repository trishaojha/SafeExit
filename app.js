/* ═══════════════════════════════════════
   SafeExit — app.js
   All data is stored LOCALLY (localStorage).
   Nothing is ever sent to a server.
   ═══════════════════════════════════════ */

// ─── Disguise / Reveal ───────────────────────────────────────────
document.getElementById('reveal-btn').addEventListener('click', showSafeApp);
document.getElementById('hide-btn').addEventListener('click', showDisguise);

function showSafeApp() {
  document.getElementById('disguise-app').classList.add('hidden');
  document.getElementById('safe-app').classList.remove('hidden');
}

function showDisguise() {
  document.getElementById('safe-app').classList.add('hidden');
  document.getElementById('disguise-app').classList.remove('hidden');
  // Lock the log
  lockLog();
}

// ─── Tab Navigation ──────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.querySelectorAll('.tab-content').forEach(s => {
    s.classList.toggle('active', s.id === 'tab-' + name);
    s.classList.toggle('hidden', s.id !== 'tab-' + name);
  });
}

// ─── Shelter Locator ─────────────────────────────────────────────
// Embedded database of shelters by zip prefix (first 3 digits).
// Covers many US metro areas. Extend as needed.
const SHELTER_DB = {
  "070": [
    { name:"Jersey Battered Women's Service", city:"Morris County, NJ", phone:"(973) 267-4763", tags:["Open 24/7","Walk-ins welcome"] },
    { name:"New Hope Foundation", city:"Plainfield, NJ", phone:"(908) 754-6855", tags:["Open 24/7","Call ahead if possible"] },
    { name:"WISE Women's Center", city:"Somerset, NJ", phone:"(908) 355-2464", tags:["Hotline 24/7","Office 9am–7pm"] },
  ],
  "100": [
    { name:"Safe Horizon Shelter", city:"New York, NY", phone:"(800) 621-4673", tags:["Open 24/7"] },
    { name:"YWCA NYC", city:"New York, NY", phone:"(212) 273-7800", tags:["Call ahead"] },
    { name:"Urban Resource Institute", city:"Brooklyn, NY", phone:"(800) 645-3434", tags:["Open 24/7"] },
  ],
  "900": [
    { name:"Peace Over Violence", city:"Los Angeles, CA", phone:"(213) 626-3393", tags:["Open 24/7"] },
    { name:"YWCA Greater LA", city:"Los Angeles, CA", phone:"(213) 365-3925", tags:["Call ahead"] },
    { name:"A Safe Place Shelter", city:"East LA, CA", phone:"(800) 339-3940", tags:["Open 24/7"] },
  ],
  "606": [
    { name:"Sarah's Inn", city:"Chicago, IL", phone:"(708) 386-4225", tags:["Open 24/7"] },
    { name:"YWCA Metropolitan Chicago", city:"Chicago, IL", phone:"(312) 372-6600", tags:["Call ahead"] },
    { name:"Between Friends", city:"Chicago, IL", phone:"(800) 603-4357", tags:["Open 24/7"] },
  ],
  "770": [
    { name:"Houston Area Women's Center", city:"Houston, TX", phone:"(713) 528-2121", tags:["Open 24/7"] },
    { name:"The Bridge Over Troubled Waters", city:"Houston, TX", phone:"(713) 473-2801", tags:["Open 24/7"] },
  ],
  "852": [
    { name:"Sojourner Center", city:"Phoenix, AZ", phone:"(602) 244-0989", tags:["Open 24/7"] },
    { name:"UMOM New Day Centers", city:"Phoenix, AZ", phone:"(602) 263-6232", tags:["Call ahead"] },
  ],
  "300": [
    { name:"Partnership Against Domestic Violence", city:"Atlanta, GA", phone:"(770) 963-9799", tags:["Open 24/7"] },
    { name:"Gateway Center", city:"Atlanta, GA", phone:"(404) 215-6600", tags:["Open 24/7"] },
  ],
};

const FALLBACK_SHELTERS = [
  { name:"National DV Hotline", city:"Nationwide", phone:"1-800-799-7233", tags:["Open 24/7","Can find local shelters"] },
  { name:"Crisis Text Line", city:"Nationwide — text HOME to 741741", phone:"", tags:["24/7 Text support"] },
];

document.getElementById('search-btn').addEventListener('click', searchShelters);
document.getElementById('zip-input').addEventListener('keydown', e => { if (e.key === 'Enter') searchShelters(); });

function searchShelters() {
  const zip = document.getElementById('zip-input').value.trim();
  const container = document.getElementById('shelter-results');
  container.innerHTML = '';

  if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
    container.innerHTML = '<p style="color:#ef4444;padding:0 4px;font-size:.85rem;">Please enter a valid 5-digit zip code.</p>';
    return;
  }

  const prefix = zip.slice(0, 3);
  const results = SHELTER_DB[prefix] || FALLBACK_SHELTERS;
  const isFallback = !SHELTER_DB[prefix];

  if (isFallback) {
    container.innerHTML = `<p style="color:#6b7280;padding:4px;font-size:.82rem;margin-bottom:8px;">No local data for ${zip}. Showing national resources — call the hotline and they'll find shelters near you.</p>`;
  }

  results.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card shelter-card';
    const tagsHtml = s.tags.map(t =>
      `<span class="shelter-tag ${t.toLowerCase().includes('open 24') ? 'open247' : t.toLowerCase().includes('hotline') ? 'hotline' : ''}">${t}</span>`
    ).join(' ');
    card.innerHTML = `
      <div class="shelter-name">${s.name}</div>
      <div class="shelter-dist">📍 ${s.city}</div>
      ${s.phone ? `<a href="tel:${s.phone.replace(/\D/g,'')}" class="shelter-phone">📞 ${s.phone}</a>` : ''}
      <div>${tagsHtml}</div>
    `;
    container.appendChild(card);
  });
}

// ─── Checklist ───────────────────────────────────────────────────
const CHECKLIST = {
  docs: [
    "Government-issued ID",
    "Social Security card",
    "Birth certificate(s)",
    "Protective or restraining orders",
  ],
  essentials: [
    "Emergency cash or hidden funds",
    "Phone charger + backup battery",
    "Medications (1 week supply)",
    "Extra set of keys",
    "Change of clothes",
  ],
  children: [
    "Children's IDs / birth certificates",
    "School records",
    "Children's medications",
  ],
};

function buildChecklist() {
  const saved = JSON.parse(localStorage.getItem('se_checklist') || '{}');

  function renderGroup(containerId, items) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    items.forEach((label, i) => {
      const key = containerId + '_' + i;
      const checked = !!saved[key];
      const item = document.createElement('div');
      item.className = 'checklist-item' + (checked ? ' checked' : '');
      item.innerHTML = `<div class="ci-check"></div><div class="ci-label">${label}</div>`;
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
        saved[key] = item.classList.contains('checked');
        localStorage.setItem('se_checklist', JSON.stringify(saved));
        updateChecklistProgress();
      });
      el.appendChild(item);
    });
  }

  renderGroup('checklist-docs', CHECKLIST.docs);
  renderGroup('checklist-essentials', CHECKLIST.essentials);
  renderGroup('checklist-children', CHECKLIST.children);
  updateChecklistProgress();
}

function updateChecklistProgress() {
  const all = document.querySelectorAll('.checklist-item');
  const done = document.querySelectorAll('.checklist-item.checked');
  const total = all.length;
  const count = done.length;
  document.getElementById('checklist-count').textContent = `${count} of ${total}`;
  document.getElementById('checklist-fill').style.width = total ? (count / total * 100) + '%' : '0%';
}

buildChecklist();

// ─── Incident Log + PIN ──────────────────────────────────────────
const PIN_KEY    = 'se_pin';
const ENTRIES_KEY = 'se_entries';
let logUnlocked  = false;

document.getElementById('pin-btn').addEventListener('click', handlePin);
document.getElementById('pin-input').addEventListener('keydown', e => { if (e.key === 'Enter') handlePin(); });

function handlePin() {
  const input = document.getElementById('pin-input').value.trim();
  if (input.length < 4) return;

  const stored = localStorage.getItem(PIN_KEY);

  if (!stored) {
    // First time — set PIN
    localStorage.setItem(PIN_KEY, input);
    unlockLog();
  } else if (stored === input) {
    unlockLog();
  } else {
    document.getElementById('pin-error').classList.remove('hidden');
    document.getElementById('pin-input').value = '';
  }
}

function unlockLog() {
  logUnlocked = true;
  document.getElementById('log-gate').classList.add('hidden');
  document.getElementById('log-content').classList.remove('hidden');
  document.getElementById('pin-error').classList.add('hidden');
  renderEntries();
}

function lockLog() {
  logUnlocked = false;
  document.getElementById('log-gate').classList.remove('hidden');
  document.getElementById('log-content').classList.add('hidden');
  document.getElementById('pin-input').value = '';
}

document.getElementById('save-entry-btn').addEventListener('click', saveEntry);

function saveEntry() {
  const text = document.getElementById('entry-text').value.trim();
  if (!text) return;

  const location = document.getElementById('entry-location').value.trim();
  const entries = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  entries.unshift({
    id: Date.now(),
    text,
    location,
    date: new Date().toLocaleString('en-US', { month:'long', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }),
  });
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));

  document.getElementById('entry-text').value = '';
  document.getElementById('entry-location').value = '';
  renderEntries();
}

function renderEntries() {
  const entries = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  const container = document.getElementById('entries-list');
  container.innerHTML = '';

  if (!entries.length) {
    container.innerHTML = '<p style="color:#9ca3af;font-size:.83rem;text-align:center;padding:8px 0;">No entries yet. Documenting incidents can be important for legal proceedings.</p>';
    return;
  }

  entries.forEach(e => {
    const card = document.createElement('div');
    card.className = 'card entry-card';
    card.innerHTML = `
      <div class="entry-meta">
        <span>📅 ${e.date}</span>
        <button class="entry-delete" data-id="${e.id}" title="Delete entry">✕</button>
      </div>
      <div class="entry-body">${escHtml(e.text)}</div>
      ${e.location ? `<div class="entry-loc">📍 ${escHtml(e.location)}</div>` : ''}
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.entry-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const updated = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]').filter(e => e.id !== id);
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(updated));
      renderEntries();
    });
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}
