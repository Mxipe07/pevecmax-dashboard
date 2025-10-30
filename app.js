/* Dienste */
const SERVICES = [
  { name:"Home Assistant",url:"https://haos.pevecmax.uk",icon:"mdi:home-assistant",status:"ok"},
  { name:"n8n",url:"https://n8n.pevecmax.uk",icon:"simple-icons:n8n",status:"ok"},
  { name:"Paperless NGINX",url:"https://paper.pevecmax.uk",icon:"simple-icons:nginx",status:"ok"},
  { name:"Zigbee2MQTT",url:"https://z2m.pevecmax.uk",icon:"simple-icons:zigbee2mqtt",status:"ok"},
  { name:"Ugreen NAS",url:"https://nas.pevecmax.uk",icon:"mdi:server",status:"off"}
];
const cards=document.getElementById("cards");
SERVICES.forEach(s=>{
  const a=document.createElement("a");
  a.className="card";a.href=s.url;a.target="_blank";
  a.innerHTML=`<div class="icon-wrap"><iconify-icon icon="${s.icon}"></iconify-icon></div>
    <div class="meta"><div class="title">${s.name}</div>
    <div class="row"><span class="dot ${s.status}"></span><span>Status</span></div></div>`;
  cards.appendChild(a);
});

/* Theme toggle */
const root=document.documentElement,btn=document.getElementById("themeToggle"),ico=document.getElementById("themeIcon");
function setTheme(m){const t=m==="auto"? (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;
  root.setAttribute("data-theme",t);localStorage.setItem("theme",m);
  ico.setAttribute("icon",t==='dark'?'mdi:weather-night':'mdi:white-balance-sunny');}
function initTheme(){const s=localStorage.getItem("theme")||"auto";setTheme(s);
  btn.onclick=()=>{const c=localStorage.getItem("theme")||"auto";
    setTheme(c==="dark"?"light":c==="light"?"auto":"dark");};}
initTheme();

/* Google Login */
const CLIENT_ID="1077930189575-8llim8mtudif0vride790lqalj035q78.apps.googleusercontent.com";
const login=document.getElementById("login-btn"),logout=document.getElementById("logout-btn"),
      avatar=document.getElementById("avatar"),img=document.getElementById("avatar-img");

function jwtDecode(t){const p=t.split('.')[1];return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));}
function showUser(u){login.hidden=true;logout.hidden=false;avatar.hidden=false;img.src=u.picture;}
function showLoggedOut(){login.hidden=false;logout.hidden=true;avatar.hidden=true;img.removeAttribute("src");}

window.addEventListener("load",()=>{
  const t=setInterval(()=>{
    if(!window.google)return;
    clearInterval(t);
    google.accounts.id.initialize({
      client_id:CLIENT_ID,
      callback:(r)=>{const d=jwtDecode(r.credential);localStorage.setItem("pmx-user",JSON.stringify(d));showUser(d);},
      auto_select:true
    });
    google.accounts.id.prompt();
    login.onclick=()=>{google.accounts.id.prompt();};
    logout.onclick=()=>{localStorage.removeItem("pmx-user");google.accounts.id.disableAutoSelect();showLoggedOut();};
    const s=localStorage.getItem("pmx-user");s?showUser(JSON.parse(s)):showLoggedOut();
  },50);
});