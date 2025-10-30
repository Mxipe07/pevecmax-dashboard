window.addEventListener("DOMContentLoaded", () => {
  /* ===== Inline-SVGs (offline, theme-fähig via currentColor) ===== */
  const ICONS = {
    homeassistant: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.1 3.1 12h2.7v8.9h5.4v-6h1.6v6h5.4V12h2.7L12 3.1zM8 13.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm8 0a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 8.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>
      </svg>`,
    n8n: `
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <path d="M64 64a32 32 0 1 1 64 0v16h32a32 32 0 1 1 0 32h-32v32h32a32 32 0 1 1 0 32h-32v16a32 32 0 1 1-64 0v-16H32a32 32 0 1 1 0-32h32v-32H32a32 32 0 1 1 0-32h32V64zM96 48a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm0 128a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm96-80a16 16 0 1 0 0-32 16 16 0 0 0 0 32zm0 96a16 16 0 1 0 0-32 16 16 0 0 0 0 32zM48 96a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm0 64a16 16 0 1 0 0 32 16 16 0 0 0 0-32z"/>
      </svg>`,
    nginx: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 1.8 8v8L12 22l10.2-6V8L12 2zm4.9 14.2h-2.3V9.9l-3.4 6.3H9V7.8h2.3v6.2l3.4-6.2h2.2v8.4z"/>
      </svg>`,
    zigbee: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm3.9 4.8-7.3 0a5.9 5.9 0 0 1 7.3 0zM6.2 9h11.6a6 6 0 0 1-.9 3H7.1a6 6 0 0 1-.9-3zm.9 6h9.8a6 6 0 0 1-9.8 0z"/>
      </svg>`,
    server: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="7" rx="2" ry="2"/>
        <rect x="3" y="14" width="18" height="7" rx="2" ry="2"/>
        <circle cx="7" cy="6.5" r="1.2"/>
        <circle cx="7" cy="17.5" r="1.2"/>
      </svg>`
  };

  /* ===== Services (Ugreen = off, Rest ok) ===== */
  const SERVICES = [
    { name: "Home Assistant", url: "https://haos.pevecmax.uk/",  icon: "homeassistant", status: "ok"  },
    { name: "n8n",            url: "https://n8n.pevecmax.uk/",   icon: "n8n",           status: "ok"  },
    { name: "Paperless NGINX",url: "https://paper.pevecmax.uk/", icon: "nginx",         status: "ok"  },
    { name: "Zigbee2MQTT",    url: "https://z2m.pevecmax.uk/",   icon: "zigbee",        status: "ok"  },
    { name: "Ugreen NAS",     url: "https://nas.pevecmax.uk/",   icon: "server",        status: "off" }
  ];

  /* ===== Theme ===== */
  const THEME_KEY = "pmx-theme";
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");

  const systemTheme = () =>
    matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

  function applyTheme(pref) {
    const t = pref === "system" ? systemTheme() : pref;
    root.setAttribute("data-theme", t);
    toggle.querySelector(".icon").textContent = t === "light" ? "☀️" : "🌙";
    auroraSetTheme(t);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "system";
    applyTheme(saved);

    matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if ((localStorage.getItem(THEME_KEY) || "system") === "system") applyTheme("system");
    });

    toggle.addEventListener("click", () => {
      navigator.vibrate?.(10);
      const cur = localStorage.getItem(THEME_KEY) || "system";
      const next = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* ===== Aurora Hintergrund ===== */
  const aurora = (() => {
    const c = document.getElementById("aurora");
    const ctx = c.getContext("2d", { alpha: true });
    let w = 0, h = 0, dpr = 1, blobs = [], theme = "dark";

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.width = Math.floor(innerWidth * dpr);
      h = c.height = Math.floor(innerHeight * dpr);
      c.style.width = innerWidth + "px";
      c.style.height = innerHeight + "px";
      blobs = make(theme);
    }
    function make(mode) {
      const light = mode === "light";
      return Array.from({ length: 5 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (light ? 220 : 320) * (0.9 + Math.random() * 0.7) * dpr,
        vx: (Math.random() * 0.18 - 0.09) * dpr,
        vy: (Math.random() * 0.12 - 0.06) * dpr,
        hue: light ? 220 + Math.random() * 20 : 210 + Math.random() * 40,
        alpha: light ? 0.10 : 0.18
      }));
    }
    function draw() {
      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `hsla(${b.hue},70%,58%,${b.alpha})`);
        g.addColorStop(1, `hsla(${(b.hue+18)%360},60%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(draw);
    }
    function setTheme(t){ theme=t; blobs = make(theme); }
    addEventListener("resize", resize);
    resize(); draw();
    return { setTheme };
  })();

  function auroraSetTheme(t){ aurora.setTheme(t); }

  /* ===== Karten-Bau ===== */
  const cardsEl = document.getElementById("cards");

  function makeCard({ name, url, icon, status }) {
    const el = document.createElement("article");
    el.className = "card";

    const a = document.createElement("a");
    a.className = "card-link";
    a.href = url; a.target = "_blank"; a.rel = "noopener";

    const body = document.createElement("div");
    body.className = "card-body";

    const iconWrap = document.createElement("div");
    iconWrap.className = "card-icon";
    iconWrap.innerHTML = ICONS[icon] || ICONS.server;

    const main = document.createElement("div");
    main.className = "card-main";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = name;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const dot = document.createElement("span");
    dot.className = `dot ${status || "off"}`;
    const label = document.createElement("span");
    label.textContent = "Status";
    meta.append(dot, label);

    main.append(title, meta);
    body.append(iconWrap, main);
    el.append(a, body);
    return el;
  }

  function renderCards() {
    cardsEl.innerHTML = "";
    SERVICES.forEach(svc => cardsEl.appendChild(makeCard(svc)));
  }

  /* ===== Init ===== */
  initTheme();
  renderCards();
});