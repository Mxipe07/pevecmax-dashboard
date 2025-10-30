// Öffnen & Schließen des Chatfensters
const chat = document.getElementById("chatWindow");
document.getElementById("openChat").onclick = () => chat.classList.remove("hidden");
document.getElementById("closeChat").onclick = () => chat.classList.add("hidden");

const messages = document.getElementById("chatMessages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

async function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;
  messages.innerHTML += `<div><b>Du:</b> ${msg}</div>`;
  input.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();
  messages.innerHTML += `<div><b>ChatGPT:</b> ${data.reply}</div>`;
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.onclick = sendMessage;
input.addEventListener("keydown", (e) => e.key === "Enter" && sendMessage());