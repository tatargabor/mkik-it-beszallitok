// State
let allCompanies = [];
let filteredCompanies = [];
let selectedCounties = new Set();
let searchTerm = '';
let searchTimeout = null;

// DOM refs
const companyListEl = document.getElementById('company-list');
const countyListEl = document.getElementById('county-list');
const searchInput = document.getElementById('search-input');
const resultCount = document.getElementById('result-count');

// Init
async function init() {
  const res = await fetch('data/companies.json');
  allCompanies = await res.json();
  renderCountyFilter();
  applyFilters();
}

// County filter
function renderCountyFilter() {
  const countySet = new Set();
  for (const c of allCompanies) {
    if (c.counties) c.counties.forEach(cn => countySet.add(cn));
  }
  const counties = [...countySet].sort((a, b) => a.localeCompare(b, 'hu'));

  countyListEl.innerHTML = '';
  for (const name of counties) {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = name;
    cb.addEventListener('change', () => {
      if (cb.checked) selectedCounties.add(name);
      else selectedCounties.delete(name);
      label.classList.toggle('checked', cb.checked);
      applyFilters();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(name));
    countyListEl.appendChild(label);
  }

  document.getElementById('select-all').addEventListener('click', () => {
    countyListEl.querySelectorAll('label').forEach(lbl => {
      const cb = lbl.querySelector('input');
      cb.checked = true;
      selectedCounties.add(cb.value);
      lbl.classList.add('checked');
    });
    applyFilters();
  });

  document.getElementById('select-none').addEventListener('click', () => {
    countyListEl.querySelectorAll('label').forEach(lbl => {
      const cb = lbl.querySelector('input');
      cb.checked = false;
      lbl.classList.remove('checked');
    });
    selectedCounties.clear();
    applyFilters();
  });
}

// Search
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchTerm = searchInput.value.trim().toLowerCase();
    applyFilters();
  }, 300);
});

// Filter logic
function matchesSearch(c) {
  if (!searchTerm) return true;
  const fields = [
    c.name,
    c.hq_city,
    c.intro,
    ...(c.softwares || []).map(s => s.name)
  ];
  return fields.some(f => f && f.toLowerCase().includes(searchTerm));
}

function matchesCounty(c) {
  if (selectedCounties.size === 0) return true;
  if (!c.counties) return false;
  return c.counties.some(cn => selectedCounties.has(cn));
}

function applyFilters() {
  filteredCompanies = allCompanies.filter(c => matchesCounty(c) && matchesSearch(c));
  resultCount.textContent = `Találatok: ${filteredCompanies.length} cég`;
  renderCompanies();
}

// Render
function renderCompanies() {
  companyListEl.innerHTML = '';
  for (const c of filteredCompanies) {
    const card = document.createElement('div');
    card.className = 'company-card';

    const header = document.createElement('div');
    header.className = 'company-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'company-name';
    nameEl.textContent = c.name;

    const metaEl = document.createElement('span');
    metaEl.className = 'company-meta';
    const parts = [];
    if (c.hq_city) parts.push(c.hq_city);
    if (c.softwares) parts.push(`${c.softwares.length} szoftver`);
    if (c.counties) parts.push(`${c.counties.length} megye`);
    metaEl.textContent = parts.join(' | ');

    header.appendChild(nameEl);
    header.appendChild(metaEl);

    const details = document.createElement('div');
    details.className = 'company-details';
    details.innerHTML = buildDetails(c);

    header.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    card.appendChild(header);
    card.appendChild(details);
    companyListEl.appendChild(card);
  }
}

function buildDetails(c) {
  let html = '<dl>';

  if (c.hq_zip || c.hq_city || c.hq_address) {
    html += '<dt>Székhely</dt><dd>' + [c.hq_zip, c.hq_city, c.hq_address].filter(Boolean).join(', ') + '</dd>';
  }
  if (c.mail_address) html += '<dt>Levelezési cím</dt><dd>' + esc(c.mail_address) + '</dd>';
  if (c.contact_name) html += '<dt>Kapcsolattartó</dt><dd>' + esc(c.contact_name) + '</dd>';
  if (c.contact_email) html += '<dt>Email</dt><dd><a href="mailto:' + esc(c.contact_email) + '">' + esc(c.contact_email) + '</a></dd>';
  if (c.website) html += '<dt>Weboldal</dt><dd><a href="' + esc(c.website) + '" target="_blank" rel="noopener">' + esc(c.website) + '</a></dd>';

  if (c.counties) {
    html += '<dt>Megyék</dt><dd>' + c.counties.map(cn => '<span class="tag">' + esc(cn) + '</span>').join('') + '</dd>';
  }

  if (c.tenders && c.tenders.length) {
    html += '<dt>Pályázatok</dt><dd>' + c.tenders.map(t => '<span class="tag">' + esc(t.name) + '</span>').join('') + '</dd>';
  }

  if (c.intro) html += '<dt>Bemutatkozás</dt><dd>' + esc(c.intro) + '</dd>';
  if (c.case_study) html += '<dt>Esettanulmány</dt><dd>' + esc(c.case_study) + '</dd>';

  if (c.softwares && c.softwares.length) {
    html += '<dt>Szoftverek</dt><dd>';
    html += '<table class="sw-table"><tr><th>Név</th><th>Típus</th><th>Deploy</th><th>Fókusz</th></tr>';
    for (const s of c.softwares) {
      html += '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.type || '') + '</td><td>' + esc(s.deployment || '') + '</td><td>' + esc(s.focus_areas || '') + '</td></tr>';
    }
    html += '</table></dd>';
  }

  html += '</dl>';
  return html;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Sidebar toggle (mobile)
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

function toggleSidebar() {
  const isOpen = document.body.classList.toggle('sidebar-open');
  hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

hamburgerBtn.addEventListener('click', toggleSidebar);
sidebarBackdrop.addEventListener('click', toggleSidebar);

// Expose for llm.js
window.getFilteredCompanies = () => filteredCompanies;

init();
