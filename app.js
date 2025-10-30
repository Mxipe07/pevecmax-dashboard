window.addEventListener("DOMContentLoaded", () => {
  // 1) Services (Status aktuell statisch – genau wie dein Screenshot)
  const SERVICES = [
    {
      name: "Home Assistant",
      url: "https://haos.pevecmax.uk/",
      icon: "https://raw.githubusercontent.com/home-assistant/assets/master/logo/logo-small.png",
      status: "ok",
    },
    {
      name: "n8n",
      url: "https://n8n.pevecmax.uk/",
      icon: "https://n8n.io/favicon-96x96.png",
      status: "ok",
    },
    {
      name: "Paperless NGINX",
      url: "https://paper.pevecmax.uk/",
      icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nginx.svg",
      status: "ok",
    },
    {
      name: "Zigbee2MQTT",
      url: "https://z2m.pevecmax.uk/",
      icon: "https://www.zigbee2mqtt.io/logo.png",
      status: "ok",
    },
    {
      name: "Ugreen NAS",
      url: "https://nas.pevecmax.uk/",
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/67/Server_icon_2.svg",
      status: "ok", // stell hier auf "off", wenn dein NAS down ist
    },
  ];

  const cardsEl = document.getElementById("cards");
  function makeCard({ name, url, icon, status }) {
    const el = document.createElement("article");
    el.className = "card";

    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.className = "card-link"; a.style.position="absolute"; a.style.inset="0"; a.style.zIndex="1";

    const body = document.createElement("div"); body.className = "card-body";

    const iconWrap = document.createElement("div"); iconWrap.className = "card-icon";
    const img = document.createElement("img"); img.src = icon; img.alt = name;
    iconWrap.appendChild(img);

    const main = document.createElement("div"); main.className = "card-main";
    const title = document.createElement("div"); title.className = "card-title"; title.textContent = name;
    const meta = document.createElement("div"); meta.className = "card-meta";
    const dot = document.createElement("span"); dot.className = `dot ${status}`;
    const label = document.createElement("span"); label.textContent = "Status";
    meta.append(dot, label);

    main.append(title, meta);
    body.append(iconWrap, main);
    el.append(a, body);
    return el;
  }
  SERVICES.forEach(svc => cardsEl.appendChild(makeCard(svc)));

  // 2) Aurora-Background (smooth, diskret)
  const aurora = (() => {
    const c = document.getElementById("aurora");
    const ctx = c.getContext("2d");
    let w, h, blobs = [], theme = "dark";
    function resize(){
      w = c.width = innerWidth; h = c.height = innerHeight;
      blobs = Array.from({length:5}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: 260 + Math.random()*200,
        vx: Math.random()*0.4 - 0.2, vy: Math.random()*0.3 - 0.15,
        hue: 220 + Math.random()*30,
        alpha: theme === "light" ? 0.10 : 0.20,
      }));
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation="lighter";
      for(const b of blobs){
        b.x+=b.vx; b.y+=b.vy;
        if(b.x<-b.r) b.x=w+b.r; if(b.x>w+b.r) b.x=-b.r;
        if(b.y<-b.r) b.y=h+b.r; if(b.y>h+b.r) b.y=-b.r;
        const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
        g.addColorStop(0,`hsla(${b.hue},70%,60%,${b.alpha})`);
        g.addColorStop(1,`hsla(${b.hue},70%,40%,0)`);
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalCompositeOperation="source-over";
      requestAnimationFrame(draw);
    }
    function setTheme(t){ theme=t; resize(); }
    addEventListener("resize",resize); resize(); draw();
    return { setTheme };
  })();

  // 3) Theme Toggle (System → Hell → Dunkel)
  const THEME_KEY="pmx-theme";
  const root=document.documentElement;
  const toggle=document.getElementById("theme-toggle");
  const systemTheme=()=>matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";

  function applyTheme(pref){
    const t = pref==="system" ? systemTheme() : pref;
    root.setAttribute("data-theme",t);
    toggle.querySelector(".icon").textContent = t==="light"?"☀️":"🌙";
    aurora.setTheme(t);
  }
  function initTheme(){
    const saved=localStorage.getItem(THEME_KEY)||"system";
    applyTheme(saved);
    matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{
      if((localStorage.getItem(THEME_KEY)||"system")==="system") applyTheme("system");
    });
    toggle.addEventListener("click",()=>{
      navigator.vibrate?.(10);
      const cur=localStorage.getItem(THEME_KEY)||"system";
      const next=cur==="system"?"light":cur==="light"?"dark":"system";
      localStorage.setItem(THEME_KEY,next);
      applyTheme(next);
    });
  }
  initTheme();
});