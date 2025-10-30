// app.js (Ausschnitt – ersetze die init/overlay-Teile)

const fab = document.getElementById('fab');
const overlay = document.getElementById('chat-overlay');
const closeBtn = document.getElementById('chat-close');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const messagesWrap = document.getElementById('chat-messages');

// Zustand
let overlayOpen = false;

function openOverlay() {
  if (overlayOpen) return;
  overlay.classList.add('open');
  document.body.classList.add('no-scroll');
  overlayOpen = true;
  input?.focus();
}

function closeOverlay() {
  if (!overlayOpen) return;
  overlay.classList.remove('open');
  document.body.classList.remove('no-scroll');
  overlayOpen = false;
}

fab?.addEventListener('click', openOverlay);
closeBtn?.addEventListener('click', closeOverlay);

// ESC zum schließen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOverlay();
});

// NICHT automatisch öffnen – keine Auto-Init die openOverlay() ruft!

// Senden -> streamen
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // eigene Bubble
  addBubble('user', text);
  input.value = '';

  // Assistent-Bubble (stream)
  const node = addBubble('assistant', '…');

  const resp = await fetch('/api/chat-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });

  if (!resp.ok || !resp.body) {
    node.textContent = 'Fehler beim Abruf.';
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let acc = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    node.textContent = acc;
    messagesWrap.scrollTop = messagesWrap.scrollHeight;
  }
});

function addBubble(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `bubble ${role}`;
  wrap.textContent = text;
  messagesWrap.appendChild(wrap);
  messagesWrap.scrollTop = messagesWrap.scrollHeight;
  return wrap;
}