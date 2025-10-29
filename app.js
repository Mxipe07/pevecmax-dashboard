const log = document.getElementById('chatlog');
const input = document.getElementById('prompt');
const btn = document.getElementById('send');

function push(role, text){
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'you' : 'ai'}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function ask(text){
  if(!text) return;
  push('user', text);
  input.value = '';
  btn.disabled = true;

  try{
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message: text})
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    push('assistant', data.reply || '(keine Antwort)');
  }catch(e){
    push('assistant', 'Fehler: '+e.message);
  }finally{
    btn.disabled = false;
    input.focus();
  }
}

btn?.addEventListener('click', () => ask(input.value.trim()));
input?.addEventListener('keydown', e => {
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    ask(input.value.trim());
  }
});
