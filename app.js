/* ============================
   SERVICES (wie zuvor)
   ============================ */
const SERVICES = [
  { name: "Home Assistant",   url: "https://haos.pevecmax.uk/",   host: "haos.pevecmax.uk:443",   icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/homeassistant.svg" },
  { name: "n8n",               url: "https://n8n.pevecmax.uk/",    host: "n8n.pevecmax.uk:443",    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/n8n.svg" },
  { name: "Paperless NGINX",   url: "https://paper.pevecmax.uk/",  host: "paper.pevecmax.uk:443",  icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nginx.svg" },
  { name: "Zigbee2MQTT",       url: "https://z2m.pevecmax.uk/",    host: "z2m.pevecmax.uk:443",    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/zigbee.svg" },
  { name: "Ugreen NAS",        url: "https://nas.pevecmax.uk/",    host: "nas.pevecmax.uk:443",    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/network.svg" }
];

/* ============================
   THEME: Auto + Toggle
   ============================ */
const THEME_KEY = 'pmx-theme'; // 'light' | 'dark' | 'system'
const root = document.documentElement;

function getSystemTheme(){
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function applyTheme(theme){
  const t = theme === 'system' ? getSystemTheme() : theme;
  root.setAttribute('data-theme', t);
  // Button-Icon
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.querySelector('.icon').textContent = t === 'light' ? '☀️' : '🌙';
  // Aurora anpassen
  auroraSetTheme(t);
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  const initial = saved || 'system';
  applyTheme(initial);
  // Reagiert auf Systemwechsel, wenn „system“
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if ((localStorage.getItem(THEME_KEY) || 'system') === 'system') applyTheme('system');
  });
  // Toggle
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    navigator.vibrate?.(10);
    const current = root.getAttribute('data-theme'); // aktuelle, angewendete
    // Zyklus: system -> light -> dark -> system
    const pref = localStorage.getItem(THEME_KEY) || 'system';
    let next;
    if (pref === 'system')      next = 'light';
    else if (pref === 'light')  next = 'dark';
    else                        next = 'system';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }, {passive:true});
}

/* ============================
   Aurora Background (Canvas)
   ============================ */
const aurora = (() => {
  const c = document.getElementById('aurora');
  const ctx = c.getContext('2d', { alpha:true });
  let w=0,h=0,dpr=1, blobs=[], theme='dark';

  function resize(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.width = Math.floor(innerWidth * dpr);
    h = c.height = Math.floor(innerHeight * dpr);
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
    blobs = makeBlobs(theme);
  }
  function makeBlobs(mode){
    const light = mode === 'light';
    const count = 5;
    const arr = [];
    for (let i=0;i<count;i++){
      arr.push({
        x: Math.random()*w, y: Math.random()*h,
        r: (light ? 240 : 340) * (0.8 + Math.random()*0.6) * dpr,
        vx: (Math.random()*0.18 - 0.09) * dpr,
        vy: (Math.random()*0.12 - 0.06) * dpr,
        hue: light ? 220 + Math.random()*40 : 260 + Math.random()*60,
        alpha: light ? 0.10 : 0.18
      });
    }
    return arr;
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs){
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = w + b.r;
      if (b.x >  w+b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y >  h+b.r) b.y = -b.r;

      b.hue += 0.015;
      if (b.hue > 360) b.hue -= 360;

      const grad = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      const c1 = `hsla(${b.hue}, ${theme==='light'?70:85}%, ${theme==='light'?65:58}%, ${b.alpha})`;
      const c2 = `hsla(${(b.hue+35)%360}, ${theme==='light'?60:80}%, ${theme==='light'?70:50}%, 0)`;
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }
  function setTheme(t){
    theme = t;
    blobs = makeBlobs(theme);
  }
  addEventListener('resize', resize, {passive:true});
  resize(); draw();
  return { setTheme };
})();
function auroraSetTheme(t){ aurora.setTheme(t); }

/* ============================
   UI / Cards
   ============================ */
const cardsEl = document.getElementById('cards');

function createCard(svc){
  const card = document.createElement('article');
  card.className = 'card';

  const a = document.createElement('a');
  a.href = svc.url; a.className = 'card-link'; a.target = '_blank'; a.rel='noopener';

  const body = document.createElement('div');
  body.className = 'card-body';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'card-icon';
  const icon = document.createElement('img'); icon.src = svc.icon; icon.alt = '';
  iconWrap.appendChild(icon);

  const main = document.createElement('div'); main.className='card-main';
  const title = document.createElement('div'); title.className='card-title'; title.textContent = svc.name;

  const meta = document.createElement('div'); meta.className='card-meta';
  const dot = document.createElement('span'); dot.className='dot off';
  const label = document.createElement('span'); label.textContent = 'Status';
  meta.append(dot, label);

  main.append(title, meta);

  const details = document.createElement('div');
  details.className = 'card-details';
  details.innerHTML = `
    <div><strong>Host:</strong> <span>${svc.host ?? new URL(svc.url).host}</span></div>
    <div><strong>Ping:</strong> <span data-ping>-</span></div>
  `;

  body.append(iconWrap, main);
  card.append(a, body, details);

  return { card, dot, pingEl: details.querySelector('[data-ping]') };
}

/* Status-/Ping-Check (einfach, robust) */
const PING_TIMEOUT_MS = 3500;
async function ping(url){
  const ctl = new AbortController();
  const to = setTimeout(()=>ctl.abort(), PING_TIMEOUT_MS);
  const start = performance.now();
  try{
    await fetch(url, { mode:'no-cors', cache:'no-store', signal: ctl.signal });
    clearTimeout(to);
    return { ok:true, ms: Math.round(performance.now()-start) };
  }catch(_e){
    clearTimeout(to);
    return { ok:false, ms:null };
  }
}

/* Scroll-Expand/Collapse */
let lastY = scrollY;
function setupScrollExpand(cardEl){
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      const goingDown = scrollY > lastY;
      if (goingDown && e.isIntersecting && e.intersectionRatio > .55){
        if (!cardEl.classList.contains('expanded')){
          navigator.vibrate?.(10);
          cardEl.classList.add('expanded');
        }
      }
      if (!goingDown && e.intersectionRatio < .35){
        if (cardEl.classList.contains('expanded')){
          navigator.vibrate?.(6);
          cardEl.classList.remove('expanded');
        }
      }
    }
    lastY = scrollY;
  }, { threshold:[0,.35,.55,1]});
  io.observe(cardEl);
}

/* Init */
(async function init(){
  initTheme();

  const rendered = SERVICES.map(s=>createCard(s));
  rendered.forEach(r => cardsEl.appendChild(r.card));

  // Pings (vereinfachte Logik; du wolltest Livecode erstmal nicht)
  for (let i=0;i<SERVICES.length;i++){
    const s = SERVICES[i], r = rendered[i];
    const res = await ping(s.url);
    if (res.ok){
      r.dot.className = 'dot ok';
      r.pingEl.textContent = `${res.ms} ms`;
      r.card.classList.add('ok');
    }else{
      r.dot.className = 'dot off';
      r.pingEl.textContent = '—';
      r.card.classList.remove('ok');
    }
    setupScrollExpand(r.card);
  }

  // sanfter Initial-Reveal
  requestAnimationFrame(()=>{
    document.querySelectorAll('.card').forEach((el,idx)=>{
      el.style.transform = 'translateY(14px) scale(.995)';
      el.style.opacity = '0';
      setTimeout(()=>{
        el.style.transition = 'transform .7s cubic-bezier(.2,.7,.2,1), opacity .6s ease';
        el.style.transform = 'none';
        el.style.opacity = '1';
      }, 60 + idx*70);
    });
  });
})();