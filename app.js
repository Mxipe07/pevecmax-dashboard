// Ping einer Ziel-URL. Viele Dienste blocken HEAD → GET no-cors.
// Ergebnis: 'green' erreichbar, 'orange' (Fallback via /api/health), 'gray' tot.
async function ping(url, ms=2500){
  try{
    const ctl = new AbortController();
    const t = setTimeout(()=>ctl.abort(), ms);
    await fetch(url, { mode:'no-cors', method:'GET', signal: ctl.signal, cache:'no-store' });
    clearTimeout(t);
    return 'green';
  }catch(e){
    try{
      const res = await fetch('/api/health', {cache:'no-store'});
      return res.ok ? 'orange' : 'gray';
    }catch{ return 'gray'; }
  }
}

function setDot(el, state){
  const map = {
    green: 'radial-gradient(circle at 30% 30%, #3cff8f 0%, #11b25b 60%)',
    orange: 'radial-gradient(circle at 30% 30%, #ffd38b 0%, #ff8f3c 60%)',
    gray: 'radial-gradient(circle at 30% 30%, #c7c7c7 0%, #7f7f7f 60%)'
  };
  el.style.background = map[state] || map.gray;
  el.style.boxShadow = '0 0 0 2px rgba(0,0,0,.45), 0 0 12px rgba(255,255,255,.12) inset';
}

// Initial + gelegentlich neu prüfen
async function initDots(){
  const dots = document.querySelectorAll('.dot');
  for (const dot of dots){
    const url = dot.getAttribute('data-url');
    const state = await ping(url);
    setDot(dot, state);
  }
}
initDots();
setInterval(initDots, 60_000); // jede Minute neu