// -------------------- Services (unverändert) --------------------
const SERVICES = [
  { name: "Home Assistant", url: "https://haos.pevecmax.uk/", icon: "mdi:home-assistant", status: "ok" },
  { name: "n8n",             url: "https://n8n.pevecmax.uk/",  icon: "simple-icons:n8n",    status: "ok" },
  { name: "Paperless NGINX", url: "https://paper.pevecmax.uk/",icon: "simple-icons:nginx",  status: "ok" },
  { name: "Zigbee2MQTT",     url: "https://z2m.pevecmax.uk/",  icon: "simple-icons:zigbee2mqtt", status: "ok" },
  { name: "Ugreen NAS",      url: "https://nas.pevecmax.uk/",  icon: "mdi:server",          status: "off" },
];

function createCard(s){
  const a = document.createElement("a");
  a.className = "card";
  a.href = s.url; a.target = "_blank"; a.rel = "noopener";

  const iconWrap = document.createElement("div");
  iconWrap.className = "icon-wrap";
  const ico = document.createElement("iconify-icon");
  ico.setAttribute("icon", s.icon);
  iconWrap.appendChild(ico);

  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = s.name;

  const row = document.createElement("div");
  row.className = "row";
  const dot = document.createElement("span");
  dot.className = `dot ${s.status}`;
  const label = document.createElement("span");
  label.textContent = "Status";
  row.append(dot, label);

  meta.append(title, row);
  a.append(iconWrap, meta);
  return a;
}

// -------------------- Theme Handling --------------------
const ROOT = document.documentElement;

function applyTheme(theme){
  ROOT.setAttribute("data-theme", theme);
  const icon = document.getElementById("theme-icon");
  icon.setAttribute("icon", theme === "light" ? "ph:sun-bold" : "ph:moon-bold");
  localStorage.setItem("pevec-theme", theme);
}

function initTheme(){
  const saved = localStorage.getItem("pevec-theme");
  if (saved === "light" || saved === "dark"){
    applyTheme(saved);
  } else {
    // system default
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Karten rendern
  const wrap = document.getElementById("cards");
  SERVICES.forEach(s => wrap.appendChild(createCard(s)));

  // Theme init & toggle
  initTheme();
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = ROOT.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    // Leichtes Haptik-Feedback (falls unterstützt)
    if (navigator.vibrate) navigator.vibrate(10);
  });
});