const chatBtn = document.getElementById("chatBtn");
const chatOverlay = document.getElementById("chatOverlay");
const closeChat = document.getElementById("closeChat");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

chatBtn.onclick = () => chatOverlay.classList.remove("hidden");
closeChat.onclick = () => chatOverlay.classList.add("hidden");

async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  chatMessages.innerHTML += `<div><b>Du:</b> ${msg}</div>`;
  userInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    chatMessages.innerHTML += `<div><b>ChatGPT:</b> ${data.reply || "..."}</div>`;
  } catch {
    chatMessages.innerHTML += `<div><b>ChatGPT:</b> Keine Antwort (Fehler).</div>`;
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.onclick = sendMessage;
userInput.addEventListener("keydown", (e) => e.key === "Enter" && sendMessage());