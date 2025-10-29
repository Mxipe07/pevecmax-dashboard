// Chat UI
const overlay=document.getElementById('chat-overlay');
const openChat=document.getElementById('open-chat');
const closeChat=document.getElementById('close-chat');
const log=document.getElementById('chatlog');
const input=document.getElementById('prompt');
const send=document.getElementById('send');

openChat?.addEventListener('click',()=>overlay.classList.remove('hidden'));
closeChat?.addEventListener('click',()=>overlay.classList.add('hidden'));
overlay?.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.add('hidden');});

function push(role,text){
  const d=document.createElement('div');
  d.className=`msg ${role==='user'?'you':'ai'}`;
  d.textContent=text;
  log.appendChild(d);
  log.scrollTop=log.scrollHeight;
}
async function ask(t){
  if(!t)return;push('user',t);input.value='';send.disabled=true;
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t})});
    const j=await r.json();push('assistant',j.reply||'(keine Antwort)');
  }catch(e){push('assistant','Fehler: '+e.message);}finally{send.disabled=false;}
}
send.addEventListener('click',()=>ask(input.value.trim()));
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input.value.trim());}});

// Online/Offline Ping
async function checkStatus(card){
  const url=card.dataset.host;
  try{
    const ctrl=new AbortController();
    const id=setTimeout(()=>ctrl.abort(),4000);
    const res=await fetch(url,{mode:'no-cors',signal:ctrl.signal});
    clearTimeout(id);
    const dot=card.querySelector('.status');
    dot.style.background='var(--on)';
    dot.style.boxShadow='0 0 8px var(--on)';
  }catch{
    const dot=card.querySelector('.status');
    dot.style.background='var(--off)';
    dot.style.boxShadow='0 0 8px var(--off)';
  }
}
document.querySelectorAll('.card[data-host]').forEach(c=>checkStatus(c));