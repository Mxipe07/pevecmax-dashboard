/* ===== Theme Handling ===== */
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(mode) {
  // mode: 'light' | 'dark' | 'auto'
  root.classList.remove('light');
  if (mode === 'light') root.classList.add('light');
  localStorage.setItem('theme', mode);

  // Icon
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isLight = (mode === 'light') || (mode === 'auto' && !prefersDark);
  themeIcon.setAttribute('icon', isLight ? 'mdi:weather-sunny' : 'mdi:weather-night');
}

themeToggle.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'auto';
  const next = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
  applyTheme(next);
});

applyTheme(localStorage.getItem('theme') || 'auto');

/* ===== Google Auth (GIS OAuth 2.0 for Browser) ===== */
const CLIENT_ID = '1077930189575-8llim8mtudif0vride790lqalj035q78.apps.googleusercontent.com';

const btnLogin  = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const avatar    = document.getElementById('avatar');

let tokenClient;
let currentToken = null;

function setSignedIn(user) {
  // user: {picture, name, email}
  btnLogin.classList.add('hidden');
  btnLogout.classList.remove('hidden');
  avatar.classList.remove('hidden');
  avatar.src = user.picture || '';
  avatar.alt = user.name ? `Profilbild von ${user.name}` : 'Profilbild';
}

function setSignedOut() {
  btnLogin.classList.remove('hidden');
  btnLogout.classList.add('hidden');
  avatar.classList.add('hidden');
  avatar.src = '';
}

function saveSession(data) {
  // ttl ~ 55 min
  const exp = Date.now() + 55 * 60 * 1000;
  localStorage.setItem('auth', JSON.stringify({ ...data, exp }));
}
function loadSession() {
  try {
    const j = JSON.parse(localStorage.getItem('auth'));
    if (!j) return null;
    if (Date.now() > j.exp) { localStorage.removeItem('auth'); return null; }
    return j;
  } catch { return null; }
}

function initTokenClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'openid profile email',
    prompt: '',
    callback: async (resp) => {
      if (resp.error) { console.error(resp); alert('Google-Login fehlgeschlagen.'); return; }
      currentToken = resp.access_token;
      try {
        // Userinfo holen (liefert Bild-URL, Name, Email)
        const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        const info = await r.json();
        const user = { name: info.name, email: info.email, picture: info.picture };
        saveSession({ user, access_token: currentToken });
        setSignedIn(user);
      } catch (e) {
        console.error(e);
        alert('Profil konnte nicht geladen werden.');
      }
    }
  });
}

function login() {
  if (!window.google || !google.accounts || !google.accounts.oauth2) {
    alert('Google SDK noch nicht geladen – kurz neu laden.');
    return;
  }
  if (!tokenClient) initTokenClient();
  tokenClient.requestAccessToken(); // öffnet den Google-Flow
}

function logout() {
  const sess = loadSession();
  if (sess && sess.access_token && window.google?.accounts?.oauth2?.revoke) {
    google.accounts.oauth2.revoke(sess.access_token, () => {});
  }
  localStorage.removeItem('auth');
  currentToken = null;
  setSignedOut();
}

btnLogin.addEventListener('click', login);
btnLogout.addEventListener('click', logout);

// Beim Start UI korrekt setzen
window.addEventListener('DOMContentLoaded', () => {
  const sess = loadSession();
  if (sess?.user) {
    currentToken = sess.access_token || null;
    setSignedIn(sess.user);   // Avatar sofort zeigen
  } else {
    setSignedOut();
  }
});