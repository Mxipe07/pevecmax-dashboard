// UI-Refs
const fab = document.getElementById('fab-chat');
const overlay = document.getElementById('cgpt');
const closeBtn = document.getElementById('cgpt-close');
const clearBtn = document.getElementById('cgpt-clear');
const log = document.getElementById('cgpt-log');
const form = document.getElementById('cgpt-form');
const input = document.getElementById('cgpt-prompt');
const sendBtn = document.getElementById('cgpt-send');

const open = () => { overlay.classList.remove('hidden'); setTimeout(()=>input.focus(), 40); };
const close = () => overlay.classList.add('hidden');

fab.addEventListener('click', open);
closeBtn.addEventListener('click', close);
document.addEventListener('keydown', e => e.key === 'Escape' && close());
clearBtn.addEventListener('click', () => { log.innerHTML = '<h2 class="cgpt-hero">Wie kann ich dir helfen?</h2>'; });

function pushBubble(role, text = '') {
  const b = document.createElement('div');
  b.className = `bubble ${role}`;
  b.textContent = text;
  log.appendChild(b);
  log.scrollTop = log.scrollHeight;
  return b;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;

  pushBubble('you', msg);
  input.value = '';
  sendBtn.disabled = true;

  try {
    const res = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });

    // Streaming lesen
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let ai = pushBubble('ai', '');
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      ai.textContent += chunk;
      log.scrollTop = log.scrollHeight;
    }
    if (!ai.textContent.trim()) ai.textContent = '(keine Antwort)';
  } catch (err) {
    pushBubble('ai', 'Netzwerkfehler – probier es gleich nochmal.');
  } finally {
    sendBtn.disabled = false;
  }
});