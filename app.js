// =======================
// Konfiguration Services
// =======================
const SERVICES = [
  {
    name: 'Home Assistant',
    url: 'https://haos.pevecmax.uk',
    icon: 'mdi:home-assistant',
  },
  {
    name: 'n8n',
    url: 'https://n8n.pevecmax.uk',
    icon: 'simple-icons:n8n',
  },
  {
    name: 'Paperless NGINX',
    url: 'https://paper.pevecmax.uk',
    icon: 'simple-icons:nginx',
  },
  {
    name: 'Zigbee2MQTT',
    url: 'https://z2m.pevecmax.uk',
    icon: 'simple-icons:zigbee',
  },
  {
    name: 'Ugreen NAS',
    url: 'https://nas.pevecmax.uk',
    icon: 'ph:hard-drives-duotone',
  },
];

// =======================
// Utils
// =======================

// Haptics: kurze Vibration, wenn verfügbar
function hapticTap(ms = 10){
  try { navigator.vibrate && navigator.vibrate(ms); } catch {}
}

// robustes Ping via fetch(HEAD, no-cors) + Timeout
function pingHEAD(url, timeoutMs = 6000){
  const t = new AbortController();
  const id = setTimeout(() => t.abort('timeout'), timeoutMs);

  return fetch(url, {
    method: 'HEAD',
    mode: 'no-cors',   // verhindert CORS-Fehler; Netzfehler -> Reject
    cache: 'no-store',
    signal: t.signal,
  })
  .then(() => { clearTimeout(id); return true; })
  .catch(() => { clearTimeout(id); return false; });
}

// Bild-Fallback (manche HEADs werden geblockt)
function pingImage(url, timeoutMs = 6000){
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

// Kombiniertes Ping mit mehreren Zielen
async function checkReachable(base){
  // Reihenfolge: HEAD auf Root -> favicon -> image fallback
  const roots = [
    `${base}/`,
    `${base}/favicon.ico`,
    `${base}/robots.txt`,
  ];
  for (const u of roots){
    const ok = await pingHEAD(u);
    if (ok) return true;
  }
  // Fallback Bild
  const okImg = await pingImage(`${base}/favicon.ico`);
  return !!okImg;
}

// =======================
// DOM Rendering
// =======================
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

  // Haptics
  a.addEventListener('click', () => hapticTap(12), {passive:true});

  // Status-Element referenzieren
  a._dot = dot;
  return a;
}

const mount = document.getElementById('cards');
const cards = SERVICES.map(s => {
  const c = makeCard(s); mount.appendChild(c);
  return { el:c, svc:s };
});

// Initial + Intervall prüfen
async function refreshAll(){
  for (const {el, svc} of cards){
    el._dot.className = 'dot check';
    const ok = await checkReachable(svc.url);
    // Sonderfall: NAS darf grau sein; Rest soll grün
    if (!ok && /nas\.pevecmax\.uk/i.test(svc.url)){
      el._dot.className = 'dot off';
    } else {
      el._dot.className = ok ? 'dot ok' : 'dot off';
    }
  }
}
refreshAll();
setInterval(refreshAll, 60000);