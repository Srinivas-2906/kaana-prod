const API = window.location.origin + '/api';
const params = new URLSearchParams(window.location.search);
const grid = document.getElementById('grid');
const countEl = document.getElementById('result-count');
const fromPhone = (params.get('from') || '').replace(/\D/g, '');

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=520&fit=crop';

function showSkeletons() {
  grid.innerHTML =
    '<div class="skeleton-grid">' +
    Array(4).fill('<div class="skeleton-card"></div>').join('') +
    '</div>';
}

function bookHref(tenantSlug, serviceId, serviceTitle, waNum) {
  if (fromPhone && tenantSlug && serviceId) {
    const q = new URLSearchParams({ tenant: tenantSlug, from: fromPhone, service: serviceId });
    return `${API}/clinic/resume-booking?${q}`;
  }
  const waText = encodeURIComponent(`I'd like to book: ${serviceTitle}`);
  return waNum
    ? `https://wa.me/${waNum}?text=${waText}`
    : `https://wa.me/?text=${waText}`;
}

function cardHtml(item, tenantSlug, waNum) {
  const href = bookHref(tenantSlug, item.id, item.title, waNum);
  const needsWhatsApp = !fromPhone;

  return `
    <article class="card">
      <div class="card-media">
        <img src="${item.image || FALLBACK_IMAGE}" alt="${item.title}" loading="lazy"
          onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
      </div>
      <div class="card-body">
        <h3>${item.title}</h3>
        <div class="card-sub">${item.location || item.subtitle || ''}</div>
        <div class="card-meta">
          <span class="price">${item.price}</span>
          <span class="duration">${item.sqft || ''}</span>
        </div>
        <a class="btn-primary" href="${href}">Book on WhatsApp</a>
        ${needsWhatsApp ? '<p class="hint">Open this page from your WhatsApp chat to continue where you left off.</p>' : ''}
      </div>
    </article>
  `;
}

async function load() {
  showSkeletons();
  countEl.textContent = 'Loading services…';

  const q = new URLSearchParams();
  const tenantSlug = params.get('tenant');
  if (tenantSlug) q.set('tenant', tenantSlug);

  try {
    const res = await fetch(`${API}/properties?${q}`);
    const data = await res.json();

    document.getElementById('client-name').textContent = data.client.name;
    document.getElementById('client-city').textContent =
      data.client.city || 'Services & pricing';
    document.getElementById('brand-emoji').textContent = data.client.emoji || '🦷';

    const waNum = (
      data.client.whatsappBusinessNumber ||
      data.client.whatsappNumber ||
      data.client.agentPhone ||
      ''
    ).replace(/\D/g, '');
    const waLink = waNum
      ? `https://wa.me/${waNum}?text=${encodeURIComponent('Hi')}`
      : `https://wa.me/?text=${encodeURIComponent('Hi')}`;
    document.getElementById('wa-link').href = waLink;

    document.getElementById('hero-title').textContent =
      data.total ? `${data.total} service${data.total === 1 ? '' : 's'} available` : 'Our services';

    countEl.textContent = fromPhone
      ? 'Tap a service to return to WhatsApp — then send any message to continue'
      : data.total
        ? 'Open this link from WhatsApp to continue your booking'
        : 'No services listed yet';

    if (!data.properties.length) {
      grid.innerHTML = '<div class="empty">Services will appear here once added in your dashboard.</div>';
      return;
    }

    grid.innerHTML = data.properties.map((item) => cardHtml(item, tenantSlug, waNum)).join('');
  } catch {
    grid.innerHTML = '<div class="empty">Could not load services. Is the server running?</div>';
    countEl.textContent = 'Error loading';
  }
}

load();
