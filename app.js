// Konfiguration deiner Services (Icon-Namen: https://icon-sets.iconify.design/)
const SERVICES = [
  {
    name: 'Home Assistant',
    url: 'https://haos.pevecmax.uk',         // öffnet beim Tippen
    ping: 'https://haos.pevecmax.uk/favicon.ico', // zum Pingen (Image-Trick)
    icon: 'mdi:home-assistant',
  },
  {
    name: 'n8n',
    url: 'https://n8n.pevecmax.uk',
    ping: 'https://n8n.pevecmax.uk/favicon.ico',
    icon: 'simple-icons:n8n',
  },
  {
    name: 'Paperless NGINX',
    url: 'https://paper.pevecmax.uk',
    ping: 'https://paper.pevecmax.uk/favicon.ico',
    icon: 'simple-icons:nginx',
  },
  {
    name: 'Zigbee2MQTT',
    url: 'https://z2m.pevecmax.uk',
    ping: 'https://z2m.pevecmax.uk/favicon.ico',
    icon: 'simple-icons:zigbee',
  },
  {
    name: 'Ugreen NAS',
    url: 'https://nas.pevecmax.uk',
    ping: 'https://nas.pevecmax.uk/favicon.ico',
    icon: 'ph:hard-drives-duotone',
  },
];

// Hilfsfunktion: Karte als DOM erzeugen
function createCard(service) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href = service.url;
  a.target = '_blank';
  a.rel = 'noopener';

  // Icon
  const iconWrap = document.createElement('div');
  iconWrap.className = 'icon-wrap';
  const icon = document.createElement('iconify-icon');
  icon.setAttribute('icon', service.icon);
  iconWrap.appendChild(icon);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'meta';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = service.name;

  const row = document.createElement('div');
  row.className = 'row';
  const dot = document.createElement('span');
  dot.className = 'dot off'; // default: grau
  dot.title = 'Status';
  const label = document.createElement('span');
  label.textContent = 'Status';
  row.append(dot, label);

  meta.append(title, row);
  a.append(iconWrap, meta);
  // Status-Element referenzieren
  a._statusDot = dot;

  return a;
}

// Reachability via Image() – misst Latenz; >2000ms = warn, Fehler = off
function pingService(card, url) {
  const start = performance.now();
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok) => {
      const latency = performance.now() - start;
      if (!ok) {
        card._statusDot.className = 'dot off';
      } else if (latency > 2000) {
        card._statusDot.className = 'dot warn';
      } else {
        card._statusDot.className = 'dot ok';
      }
      resolve({ ok, latency });
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    // Cache umgehen:
    img.src = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
  });
}

// Render + zyklisches Pingen
const mount = document.getElementById('cards');
const cards = SERVICES.map(svc => {
  const card = createCard(svc);
  mount.appendChild(card);
  // initial ping
  pingService(card, svc.ping);
  return { svc, card };
});

// Alle 60s neu prüfen
setInterval(() => {
  cards.forEach(({ svc, card }) => pingService(card, svc.ping));
}, 60000);