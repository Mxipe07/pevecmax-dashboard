// Services – du kannst pingTargets beliebig ergänzen.
// Wir testen nacheinander, bis eins erfolgreich lädt.
const SERVICES = [
  {
    name: 'Home Assistant',
    url: 'https://haos.pevecmax.uk',
    pingTargets: [
      'https://haos.pevecmax.uk/favicon.ico',
      'https://haos.pevecmax.uk/',
    ],
    icon: 'mdi:home-assistant',
  },
  {
    name: 'n8n',
    url: 'https://n8n.pevecmax.uk',
    pingTargets: [
      'https://n8n.pevecmax.uk/favicon.ico',
      'https://n8n.pevecmax.uk/',
    ],
    icon: 'simple-icons:n8n',
  },
  {
    name: 'Paperless NGINX',
    url: 'https://paper.pevecmax.uk',
    pingTargets: [
      'https://paper.pevecmax.uk/favicon.ico',
      'https://paper.pevecmax.uk/',
    ],
    icon: 'simple-icons:nginx',
  },
  {
    name: 'Zigbee2MQTT',
    url: 'https://z2m.pevecmax.uk',
    pingTargets: [
      'https://z2m.pevecmax.uk/favicon.ico',
      'https://z2m.pevecmax.uk/',
    ],
    icon: 'simple-icons:zigbee',
  },
  {
    name: 'Ugreen NAS',
    url: 'https://nas.pevecmax.uk',
    pingTargets: [
      'https://nas.pevecmax.uk/favicon.ico',
      'https://nas.pevecmax.uk/',
    ],
    icon: 'ph:hard-drives-duotone',
  },
];

// ----- DOM Rendering -----
function makeCard(svc){
  const a = document.createElement('a');
  a.className = 'card';
  a.href = svc.url; a.target = '_blank'; a.rel='noopener';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'icon-wrap';
  const icon = document.createElement('iconify-icon');
  icon.setAttribute('icon', svc.icon);
  iconWrap.appendChild(icon);

  const meta = document.createElement('div'); meta.className = 'meta';
  const title = document.createElement('div'); title.className = 'title'; title.textContent = svc.name;
  const row = document.createElement('div'); row.className = 'row';
  const dot = document.createElement('span'); dot.className='dot check'; dot.title='Status';
  const label = document.createElement('span'); label.textContent = 'Status';
  row.append(dot,label);
  meta.append(title,row);

  a.append(iconWrap, meta);
  a._dot = dot;
  return a;
}

// ----- Reachability: robuste Image-Pings mit Fallbacks & Timeout -----
function pingWithImage(url, timeoutMs = 6000){
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const end = (ok) => { if (done) return; done = true; resolve(ok); };
    const t = setTimeout(() => end(false), timeoutMs);
    img.onload = () => { clearTimeout(t); end(true); };
    img.onerror = () => { clearTimeout(t); end(false); };
    img.src = `${url}${url.includes('?')?'&':'?'}_=${Date.now()}`;
  });
}
async function checkService(dotEl, targets){
  dotEl.className = 'dot check';
  for (const t of targets){
    const ok = await pingWithImage(t);
    if (ok){ dotEl.className = 'dot ok'; return; }
  }
  dotEl.className = 'dot off';
}

// ----- Mount -----
const mount = document.getElementById('cards');
const cards = SERVICES.map(s => {
  const c = makeCard(s); mount.appendChild(c);
  checkService(c._dot, s.pingTargets);
  return { el:c, svc:s };
});

// Re-Check alle 60s
setInterval(() => {
  cards.forEach(({el,svc}) => checkService(el._dot, svc.pingTargets));
}, 60000);