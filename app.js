window.addEventListener("DOMContentLoaded", () => {

  const SERVICES = [
    {
      name: "Home Assistant",
      url: "https://haos.pevecmax.uk/",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/homeassistant.svg",
      status: "ok"
    },
    {
      name: "n8n",
      url: "https://n8n.pevecmax.uk/",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/n8n.svg",
      status: "ok"
    },
    {
      name: "Paperless NGINX",
      url: "https://paper.pevecmax.uk/",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nginx.svg",
      status: "ok"
    },
    {
      name: "Zigbee2MQTT",
      url: "https://z2m.pevecmax.uk/",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/zigbee.svg",
      status: "ok"
    },
    {
      name: "Ugreen NAS",
      url: "https://nas.pevecmax.uk/",
      icon: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/server.svg",
      status: "off"
    }
  ];

  /* === Theme === */
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
      if ((localStorage.getItem(THEME_KEY) || "system") === "system")
        applyTheme("system");
    });
    toggle.addEventListener("click", () => {
      navigator.vibrate?.(10);
      const cur = localStorage.getItem(THEME_KEY) || "system";
      const next =
        cur === "system" ? "light" : cur === "light" ? "dark" : "system";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* === Aurora Background === */
  const aurora = (() => {
    const c = document.getElementById("aurora");
    const ctx = c.getContext("2d", { alpha: true });
    let w = 0,
      h = 0,
      dpr = 1,
      blobs = [],
      theme = "dark";

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
        r: (light ? 260 : 340) * (0.8 + Math.random() * 0.6) * dpr,
        vx: (Math.random() * 0.18 - 0.09) * dpr,
        vy: (Math.random() * 0.12 - 0.06) * dpr,
        hue: 210 + Math.random() * 40,
        alpha: light ? 0.10 : 0.18,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        const c1 = `hsla(${b.hue}, 70%, 58%, ${b.alpha})`;
        const c2 = `hsla(${(b.hue + 20) % 360}, 60%, 50%, 0)`;
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(draw);
    }

    function setTheme(t) {
      theme = t;
      blobs = make(theme);
    }

    addEventListener("resize", resize);
    resize();
    draw();
    return { setTheme };
  })();

  function auroraSetTheme(t) {
    aurora.setTheme(t);
  }

  /* === Karten === */
  const cardsEl = document.getElementById("cards");

  function makeCard({ name, url, icon, status }) {
    const el = document.createElement("article");
    el.className = "card";
    const a = document.createElement("a");
    a.className = "card-link";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";

    const body = document.createElement("div");
    body.className = "card-body";

    const iconWrap = document.createElement("div");
    iconWrap.className = "card-icon";
    const img = document.createElement("img");
    img.src = icon;
    iconWrap.appendChild(img);

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
    SERVICES.forEach((svc) => cardsEl.appendChild(makeCard(svc)));
  }

  /* === Init === */
  initTheme();
  renderCards();

});