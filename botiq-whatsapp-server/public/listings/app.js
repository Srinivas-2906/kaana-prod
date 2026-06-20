const API = window.location.origin + '/api';
const FALLBACK_BY_TYPE = {
  '2BHK': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=520&fit=crop&q=80',
  '3BHK': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=520&fit=crop&q=80',
  Villa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=520&fit=crop&q=80',
  Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=520&fit=crop&q=80',
};

const params = new URLSearchParams(window.location.search);
const grid = document.getElementById('grid');
const countEl = document.getElementById('result-count');
const bhkSel = document.getElementById('filter-bhk');
const budgetSel = document.getElementById('filter-budget');

if (params.get('bhk')) {
  const bhk = params.get('bhk').includes('BHK') ? params.get('bhk') : params.get('bhk') + 'BHK';
  bhkSel.value = bhk.replace(' Apartment', '');
}

if (params.get('budgetMin') && params.get('budgetMax')) {
  const min = Number(params.get('budgetMin'));
  const max = Number(params.get('budgetMax'));
  if (min === 50 && max === 75) budgetSel.value = '50-75';
  else if (min === 75 && max === 100) budgetSel.value = '75-100';
  else if (min === 100 && max === 150) budgetSel.value = '100-150';
  else if (min >= 150) budgetSel.value = '150-999';
}

function badgeClass(status) {
  if (/construction/i.test(status)) return 'under-construction';
  if (/2025|2026/i.test(status)) return 'upcoming';
  return '';
}

function showSkeletons() {
  grid.innerHTML = '<div class="skeleton-grid">' +
    Array(6).fill('<div class="skeleton-card"></div>').join('') +
    '</div>';
}

function cardHtml(p) {
  const waText = encodeURIComponent(`Book visit — ${p.title}`);
  const badgeCls = badgeClass(p.status);

  return `
    <article class="card">
      <div class="card-media">
        <img
          src="${p.image}"
          alt="${p.title}"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_BY_TYPE[p.bhk] || FALLBACK_BY_TYPE['2BHK']}';"
        >
        <span class="badge ${badgeCls}">${p.status}</span>
        <span class="type-chip">${p.bhk}</span>
      </div>
      <div class="card-body">
        <h3>${p.title}</h3>
        <div class="loc">📍 ${p.location}</div>
        <div class="card-meta">
          <span class="price">${p.price}</span>
          <span class="sqft">${p.sqft}</span>
        </div>
        <div class="card-actions">
          <a class="btn-primary" href="https://wa.me/?text=${waText}">Book site visit</a>
        </div>
      </div>
    </article>
  `;
}

async function load() {
  showSkeletons();
  countEl.textContent = 'Loading properties…';

  const q = new URLSearchParams();
  const tenantSlug = params.get('tenant');
  if (tenantSlug) q.set('tenant', tenantSlug);
  if (bhkSel.value) q.set('bhk', bhkSel.value);
  const budget = budgetSel.value;
  if (budget) {
    const [min, max] = budget.split('-');
    q.set('budgetMin', min);
    q.set('budgetMax', max);
  }

  try {
    const res = await fetch(`${API}/properties?${q}`);
    const data = await res.json();

    document.getElementById('client-name').textContent = data.client.name;
    document.getElementById('client-city').textContent = data.client.city;
    const waNum = (data.client.whatsappNumber || data.client.agentPhone || '').replace(/\D/g, '');
    const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent('Hi')}` : `https://wa.me/?text=${encodeURIComponent('Hi')}`;
    document.getElementById('wa-link').href = waLink;

    document.getElementById('hero-title').textContent =
      data.total ? `${data.total} item${data.total === 1 ? '' : 's'} available` : 'No matches found';

    countEl.textContent = data.total
      ? `Showing ${data.total} item${data.total === 1 ? '' : 's'}`
      : 'No items match your filters';

    if (!data.properties.length) {
      grid.innerHTML = '<div class="empty">Try broadening your budget or property type.</div>';
      return;
    }

    grid.innerHTML = data.properties.map(cardHtml).join('');
  } catch {
    grid.innerHTML = '<div class="empty">Could not load listings. Is the server running?</div>';
    countEl.textContent = 'Error loading';
  }
}

document.getElementById('apply-filters').addEventListener('click', () => {
  const q = new URLSearchParams();
  const tenantSlug = params.get('tenant');
  if (tenantSlug) q.set('tenant', tenantSlug);
  if (bhkSel.value) q.set('bhk', bhkSel.value);
  const budget = budgetSel.value;
  if (budget) {
    const [min, max] = budget.split('-');
    q.set('budgetMin', min);
    q.set('budgetMax', max);
  }
  history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
  load();
});

load();
