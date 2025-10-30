/* =======================
   Services
   ======================= */
const SERVICES = [
  { name:"Home Assistant",  url:"https://haos.pevecmax.uk",     icon:"mdi:home-assistant",       status:"ok"  },
  { name:"n8n",             url:"https://n8n.pevecmax.uk",      icon:"simple-icons:n8n",         status:"ok"  },
  { name:"Paperless NGINX", url:"https://paper.pevecmax.uk",    icon:"simple-icons:nginx",       status:"ok"  },
  { name:"Zigbee2MQTT",     url:"https://z2m.pevecmax.uk",      icon:"simple-icons:zigbee2mqtt", status:"ok"  },
  { name:"Ugreen NAS",      url:"https://nas.pevecmax.uk",      icon:"mdi:server",               status:"off" }
];

const cards = document.getElementById("cards");
SERVICES.forEach(s=>{
  const a = document.createElement("a");
  a.className="card"; a.href=s.url; a.target="_blank";
  a.innerHTML = `
    <div class="icon-wrap"><iconify-icon icon="${s.icon}"></iconify-icon></div>
    <div class="meta">
      <div class="title">${s.name}</div>
      <div class="row"><span class="dot ${s.status}"></span><span>Status</span></div>
    </div>`;
  cards.appendChild(a);
});

/* =======================
   Theme
   ======================= */
const root=document.documentElement, btn=document.getElementById("themeToggle"), ico=document.getElementById("themeIcon");
function setTheme(mode){
  const t = mode==="auto" ? (matchMedia('(prefers-color-scheme: dark)').matches ? "dark":"light") : mode;
  root.setAttribute("data-theme", t);
  localStorage.setItem("theme", mode);
  ico.setAttribute("icon", t==='dark' ? 'mdi:weather-night' : 'mdi:white-balance-sunny');
}
(function initTheme(){
  const saved = localStorage.getItem("theme") || "auto";
  setTheme(saved);
  btn.onclick = () => {
    const cur = localStorage.getItem("theme") || "auto";
    setTheme(cur==="dark" ? "light" : cur==="light" ? "auto" : "dark");
  };
})();

/* =======================
   Auth UI helpers
   ======================= */
const loginBtn  = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const avatarBox = document.getElementById("avatar");
const avatarImg = document.getElementById("avatar-img");
const avatarFallback = document.getElementById("avatar-fallback");

function showLoggedOut(){
  loginBtn.hidden  = false;
  logoutBtn.hidden = true;
  avatarBox.hidden = true;
  avatarImg.removeAttribute("src");
  avatarFallback.textContent = "";
}

function initialsFromName(name=""){
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const str = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return str.toUpperCase() || "U";
}

function showUser(u){
  loginBtn.hidden  = true;
  logoutBtn.hidden = false;
  avatarBox.hidden = false;

  if (u.picture){
    avatarImg.src = u.picture;
    avatarImg.style.display = "block";
    avatarFallback.textContent = "";
  } else {
    avatarImg.removeAttribute("src");
    avatarImg.style.display = "none";
    avatarFallback.textContent = initialsFromName(u.name || u.given_name || "");
  }
}

/* Persistenz + Validierung (exp prüfen) */
const LS_KEY_USER = "pmx-user";
const LS_KEY_TOKEN = "pmx-idtoken";

function validStoredUser(){
  try{
    const user = JSON.parse(localStorage.getItem(LS_KEY_USER) || "null");
    const token = localStorage.getItem(LS_KEY_TOKEN);
    if (!user || !token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    const now = Math.floor(Date.now()/1000);
    if (!payload.exp || payload.exp <= now) { // abgelaufen
      localStorage.removeItem(LS_KEY_USER);
      localStorage.removeItem(LS_KEY_TOKEN);
      return null;
    }
    return user;
  }catch(_){ return null; }
}

/* =======================
   Google Identity Services
   ======================= */
const CLIENT_ID = "1077930189575-8llim8mtudif0vride790lqalj035q78.apps.googleusercontent.com";

function decodeJwt(token){
  return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
}

function initGoogle(){
  if (!window.google || !google.accounts?.id) return false;

  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: (resp)=>{
      try{
        const payload = decodeJwt(resp.credential);
        localStorage.setItem(LS_KEY_USER, JSON.stringify({
          sub: payload.sub,
          email: payload.email,
          name: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
          picture: payload.picture || ""
        }));
        localStorage.setItem(LS_KEY_TOKEN, resp.credential);
        showUser(JSON.parse(localStorage.getItem(LS_KEY_USER)));
      }catch(e){
        console.error("Login parse error:", e);
        showLoggedOut();
        alert("Anmeldung fehlgeschlagen.");
      }
    },
    auto_select: false,           // kein Auto-Login
    ux_mode: "popup",             // stabil auf Mobile
    cancel_on_tap_outside: false
  });

  // Login nur per Klick
  loginBtn.onclick = () => google.accounts.id.prompt();

  // Logout
  logoutBtn.onclick = () => {
    google.accounts.id.disableAutoSelect();
    localStorage.removeItem(LS_KEY_USER);
    localStorage.removeItem(LS_KEY_TOKEN);
    showLoggedOut();
  };

  return true;
}

/* ===== Startzustand erzwingen ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Immer erst ausgeloggt anzeigen
  showLoggedOut();

  // Vorhandenen, noch gültigen Nutzer wiederherstellen
  const existing = validStoredUser();
  if (existing) showUser(existing);

  // GSI initialisieren (ggf. warten bis Script geladen)
  const t = setInterval(() => {
    if (initGoogle()) clearInterval(t);
  }, 50);
  // Sicherheitsnetz: nach 5s aufgeben ohne Fehler
  setTimeout(()=>clearInterval(t), 5000);
});