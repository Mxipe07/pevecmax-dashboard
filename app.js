// --- Chat UI helpers ---
const overlay = document.getElementById('chat-overlay');
const openBtn = document.getElementById('open-chat');
const fabBtn  = document.getElementById('fab-chat');
const closeBtn= document.getElementById('close-chat');
const log     = document.getElementById('chatlog');
const input   = document.getElementById('prompt');
const sendBtn = document.getElementById('send');

function showChat(){ overlay.classList.remove('hidden'); setTimeout(()=>input?.focus(), 50); }
function hideChat(){ overlay.classList.add('hidden'); }

openBtn?.addEventListener('click', showChat);
fabBtn ?.addEventListener('click', showChat);
closeBtn?.addEventListener('click', hideChat);
overlay?.addEventListener('click', (e)=>{ if(e.target===overlay) hideChat(); });

function push(role, text){
  const div = document.createElement('div');
  div.className = `msg ${role==='user'?'you':'ai'}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function ask(text){
  if(!text) return;
  push('user', text);
  input.value = '';
  sendBtn.disabled = true;
  try{
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: text })
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    push('assistant', data.reply || '(keine Antwort)');
  }catch(e){
    push('assistant', 'Fehler: '+e.message);
  }finally{
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn?.addEventListener('click', ()=> ask(input.value.trim()));
input?.addEventListener('keydown', e => {
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ask(input.value.trim()); }
});